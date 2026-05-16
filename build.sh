


#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<EOF
Usage: $0 [--build] [--serve [PORT]] [--help]

Options:
  --build       run build steps
  --serve       start a basic Python HTTP server serving ./www
  PORT          optional port for --serve (default: 8000)
  --help        show this help message
EOF
}

build() {
    echo "Running build..."
    rm -rf www/*

    mkdir -p www
    cp static/* www
}

serve() {
    local port="${1:-8000}"
    echo "Serving ./www at http://localhost:${port}"
    cd "$(dirname "$0")/www"
    python3 -m http.server "${port}"
}

if [ $# -eq 0 ]; then
    usage
    exit 1
fi

BUILD=false
SERVE=false
SERVE_PORT=8000

while [ $# -gt 0 ]; do
    case "$1" in
        --build)
            BUILD=true
            shift
            ;;
        --serve)
            SERVE=true
            shift
            if [[ $# -gt 0 && "$1" =~ ^[0-9]+$ ]]; then
                SERVE_PORT="$1"
                shift
            fi
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            usage
            exit 1
            ;;
    esac
done

if [ "$BUILD" = true ]; then
    build
fi

if [ "$SERVE" = true ]; then
    serve "$SERVE_PORT"
fi