from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
import os
import stat
from datetime import datetime
from pathlib import Path
from django.conf import settings

PROJECT_ROOT = Path(settings.BASE_DIR)


@require_POST
@csrf_exempt
def terminal_api(request):
    try:
        body = request.body.decode('utf-8')
        data = json.loads(body) if body.strip() else {}
        command = data.get('command', '').strip()

        if not command:
            return JsonResponse({'output': '', 'prompt': get_prompt(request.session)})

        session = request.session
        current_dir = session.get('terminal_dir', str(PROJECT_ROOT))

        output = ""
        error = None
        cmd_parts = command.split()
        base_cmd = cmd_parts[0]
        args = cmd_parts[1:]

        # ─── cd ──────────────────────────────────────────────────────────────
        if base_cmd == "cd":
            if not args:
                output = current_dir
            else:
                target = args[0]
                
                new_dir = Path(current_dir) / target if not Path(target).is_absolute() else Path(target)
                new_dir = new_dir.resolve()  

              
                if new_dir.is_dir() and PROJECT_ROOT in new_dir.parents or new_dir == PROJECT_ROOT:
                    session['terminal_dir'] = str(new_dir)
                    output = f"Перешли в: {new_dir}"
                else:
                    error = f"cd: нет такого каталога или выход за пределы проекта: {target}"
        # ─── ls / ll ──────────────────────────────────────────────────────────
        elif base_cmd in ("ls", "ll"):
            show_all = "-a" in args
            long_format = base_cmd == "ll" or "-l" in args

            try:
                entries = os.listdir(current_dir)
                if not show_all:
                    entries = [e for e in entries if not e.startswith('.')]

                if long_format:
                    lines = []
                    for entry in sorted(entries):
                        try:
                            full_path = Path(current_dir) / entry
                            st = full_path.stat()
                            mode = st.st_mode
                            size = st.st_size
                            mtime = datetime.fromtimestamp(st.st_mtime)
                            date_str = mtime.strftime("%b %d %H:%M")

                            perms = stat.filemode(mode)

                            color = "\x1b[0m"
                            suffix = ""
                            if full_path.is_dir():
                                color = "\x1b[1;34m"
                                suffix = "/"
                            elif stat.S_ISLNK(mode):
                                color = "\x1b[1;36m"
                                suffix = "@"
                            elif os.access(str(full_path), os.X_OK):
                                color = "\x1b[1;32m"
                                suffix = "*"

                            line = f"{perms} 1 artem artem {size:>8} {date_str} {color}{entry}{suffix}\x1b[0m"
                            lines.append(line)
                        except Exception:
                            lines.append(f"?????????? ???????? {entry}")

                    output = "\n".join(lines) or "Пусто"
                else:
                    colored = []
                    for entry in sorted(entries):
                        full_path = Path(current_dir) / entry
                        if full_path.is_dir():
                            colored.append(f"\x1b[1;34m{entry}/\x1b[0m")
                        elif stat.S_ISLNK(full_path.stat().st_mode):
                            colored.append(f"\x1b[1;36m{entry}@\x1b[0m")
                        elif os.access(str(full_path), os.X_OK):
                            colored.append(f"\x1b[1;32m{entry}*\x1b[0m")
                        else:
                            colored.append(entry)

                    output = "  ".join(colored) if colored else "Пусто"

            except Exception as e:
                error = f"ls: ошибка: {str(e)}"

        # ─── cat ──────────────────────────────────────────────────────────────
        elif base_cmd == "cat":
            if not args:
                error = "cat: требуется имя файла"
            else:
                file_path = args[0]
                full_path = Path(current_dir) / file_path if not Path(file_path).is_absolute() else Path(file_path)
                full_path = full_path.resolve()

                if PROJECT_ROOT not in full_path.parents:
                    error = "cat: выход за пределы проекта запрещён"
                elif full_path.is_file():
                    try:
                        output = full_path.read_text(encoding='utf-8', errors='replace')
                    except PermissionError:
                        error = "cat: отказано в доступе"
                    except Exception as e:
                        error = f"cat: ошибка: {str(e)}"
                else:
                    error = f"cat: нет такого файла: {file_path}"

        # ─── tree ─────────────────────────────────────────────────────────────
        elif base_cmd == "tree":
            target = args[0] if args else "."
            full_path = Path(current_dir) / target if not Path(target).is_absolute() else Path(target)
            full_path = full_path.resolve()

            if PROJECT_ROOT not in full_path.parents or not full_path.is_dir():
                error = "tree: нет такого каталога или выход за пределы проекта"
            else:
                def build_tree(path, prefix=""):
                    lines = []
                    try:
                        entries = sorted([e for e in os.listdir(path) if not e.startswith('.')])
                        for i, entry in enumerate(entries):
                            full_entry = path / entry
                            is_last = i == len(entries) - 1
                            line_prefix = prefix + ("└── " if is_last else "├── ")
                            color = "\x1b[1;34m" if full_entry.is_dir() else "\x1b[0m"
                            lines.append(f"{line_prefix}{color}{entry}\x1b[0m")

                            if full_entry.is_dir():
                                new_prefix = prefix + ("    " if is_last else "│   ")
                                lines.extend(build_tree(full_entry, new_prefix))
                    except Exception:
                        pass
                    return lines

                tree_lines = build_tree(full_path)
                output = "\n".join(tree_lines) or "Пусто"

        # ─── pwd ──────────────────────────────────────────────────────────────
        elif base_cmd == "pwd":
            output = current_dir

        # ─── unknown ──────────────────────────────────────────────────────────
        else:
            error = f"bash: {base_cmd}: команда не найдена"

        if error:
            output = f"\x1b[31m{error}\x1b[0m"

        return JsonResponse({
            'output': output,
            'prompt': get_prompt(session)
        })

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)


def get_prompt(session):
    current_dir = session.get('terminal_dir', str(PROJECT_ROOT))
    rel_path = os.path.relpath(current_dir, PROJECT_ROOT)
    if rel_path == '.':
        rel_path = ''
    return f"user@host:~/{rel_path}$ "