from __future__ import unicode_literals


def collapse_path_parts(path):
    parts = path.split(b'/', 2)
    if len(parts) == 3:
        left = b'/'.join(parts[:2] + [b''])
        right = parts[2].replace(b'/', b'%2F')
        path = left + right
    return path
