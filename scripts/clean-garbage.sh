#!/bin/bash

# Clean ._* files and .DS_Store
echo "Cleaning macOS metadata files..."
find . -type f -name "._*" -delete
find . -type f -name ".DS_Store" -delete
echo "Cleanup complete."
