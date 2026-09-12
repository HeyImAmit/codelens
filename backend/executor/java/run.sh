#!/bin/sh

MODE="${1:-run}"

if [ "$MODE" = "compile" ]; then
    javac Main.java 2> /tmp/compile.log
    COMPILE_STATUS=$?

    if [ $COMPILE_STATUS -ne 0 ]; then
        echo "___COMPILATION_ERROR___"
        cat /tmp/compile.log
        exit 2
    fi
    exit 0
fi

# Run compiled Java bytecode
java Main
