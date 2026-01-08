#!/bin/bash
# Script para servir o frontend na porta 8080
cd "$(dirname "$0")"
npx serve -s build -l 8080
