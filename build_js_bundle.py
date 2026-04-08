#!/usr/bin/env python3
import os
import re
import subprocess

# -------------------------------
# Configuration
# -------------------------------
INDEX_PATH         = "index.php"
SANDBOX_PATH       = "index.sandbox.php"
ORDER_PATH         = "load_order.txt"
INCLUDES_PATH      = "includes/js.php"
CSS_INCLUDES_PATH  = "includes/css.php"
BUNDLE_JS_PATH     = "js/bundle.min.js"
TEMP_COMBINED_JS   = "js/bundle.raw.js"
BUNDLE_CSS_PATH    = "css/bundle.min.css"
TEMP_COMBINED_CSS  = "css/bundle.raw.css"

# -------------------------------
# Utility Functions
# -------------------------------
def read_load_order():
	local_js = []
	remote_js = []
	local_css = []
	remote_css = []

	with open(ORDER_PATH, "r", encoding="utf-8") as f:
		for line in f:
			line = line.strip()
			if not line or line.startswith("#"):
				continue

			target = line.lower()
			is_js = target.endswith(".js")
			is_css = target.endswith(".css")

			if line.lower().startswith("local:"):
				path = line[6:].strip()
				if is_js:
					local_js.append(path)
				elif is_css:
					local_css.append(path)
			elif line.lower().startswith("remote:"):
				path = line[7:].strip()
				if is_js:
					remote_js.append(path)
				elif is_css:
					remote_css.append(path)
			else:
				if is_js:
					local_js.append(line)
					remote_js.append(line)
				elif is_css:
					local_css.append(line)
					remote_css.append(line)

	return local_js, remote_js, local_css, remote_css

def combine_scripts_to_raw(remote_scripts, output_path):
	os.makedirs(os.path.dirname(output_path), exist_ok=True)
	with open(output_path, "w", encoding="utf-8") as out:
		for script in remote_scripts:
			if not os.path.exists(script):
				print(f"[!] Missing: {script} — Skipping.")
				continue

			out.write(f"/* --- BEGIN {script} --- */\n")
			with open(script, "r", encoding="utf-8") as s:
				lines = s.readlines()
				if lines and lines[0].strip().startswith("console.log( 'jestAlert: js"):
					lines = lines[1:]  # Remove the first line

				out.writelines(lines)
				out.write("\n")
	print(f"[✓] Combined raw file written: {output_path}")

def minify_js():
	try:
		subprocess.run(
			["terser", TEMP_COMBINED_JS, "-o", BUNDLE_JS_PATH, "--compress"],
			check=True
		)
		print(f"[✓] Minified JS: {BUNDLE_JS_PATH}")
	except subprocess.CalledProcessError as e:
		print("[✗] JS Minification failed:", e)

def obfuscate_js():
	try:
		subprocess.run(
			["javascript-obfuscator", BUNDLE_JS_PATH, "--output", BUNDLE_JS_PATH],
			check=True
		)
		print(f"[✓] Obfuscated JS: {BUNDLE_JS_PATH}")
	except subprocess.CalledProcessError as e:
		print("[✗] JS Obfuscation failed:", e)

def minify_css():
	try:
		subprocess.run(
			["cleancss", "-o", BUNDLE_CSS_PATH, TEMP_COMBINED_CSS],
			check=True
		)
		print(f"[✓] Minified CSS: {BUNDLE_CSS_PATH}")
	except subprocess.CalledProcessError as e:
		print("[✗] CSS Minification failed:", e)

def rewrite_index_to_sandbox():
	with open(INDEX_PATH, "r", encoding="utf-8") as f:
		html = f.read()

	# Remove all <script> and <link> tags
	html = re.sub(r'<script\s+[^>]*src=["\'].*?["\'][^>]*></script>', '', html, flags=re.IGNORECASE)
	html = re.sub(r'<link\s+[^>]*href=["\'].*?\.css["\'][^>]*>', '', html, flags=re.IGNORECASE)

	# Remove any includes to js.php or css.php in any form
	html = re.sub(r'<\?php[\s\S]*?includes/(js|css)\.php[\s\S]*?\?>', '', html, flags=re.IGNORECASE)

	# Inject bundled CSS
	html = re.sub(
		r'</head>',
		f'    <link rel="stylesheet" href="{BUNDLE_CSS_PATH}">\n</head>',
		html,
		flags=re.IGNORECASE
	)

	# Inject bundled JS
	html = re.sub(
		r'</body>',
		f'    <script src="{BUNDLE_JS_PATH}"></script>\n</body>',
		html,
		flags=re.IGNORECASE
	)

	with open(SANDBOX_PATH, "w", encoding="utf-8") as f:
		f.write(html)

	print(f"[✓] Sandbox created: {SANDBOX_PATH}")

def write_php_includes(local_scripts, target_path, tag_format):
	os.makedirs(os.path.dirname(target_path), exist_ok=True)
	with open(target_path, "w", encoding="utf-8") as f:
		for script in local_scripts:
			f.write(tag_format.format(script) + "\n")
	print(f"[✓] Includes written to: {target_path}")

# -------------------------------
# Main Execution
# -------------------------------
def main():
	print("== JEST BUNDLE SCRIPT (JS + CSS, LEGACY INCLUDES) ==")
	local_js, remote_js, local_css, remote_css = read_load_order()
	print(f"[•] {len(remote_js)} remote JS (bundled)")
	print(f"[•] {len(local_js)} local JS (php-include)")
	print(f"[•] {len(remote_css)} remote CSS (bundled)")
	print(f"[•] {len(local_css)} local CSS (php-include)")

	combine_scripts_to_raw(remote_js, TEMP_COMBINED_JS)
	minify_js()
	obfuscate_js()
	combine_scripts_to_raw(remote_css, TEMP_COMBINED_CSS)
	minify_css()
	rewrite_index_to_sandbox()
	write_php_includes(local_js, INCLUDES_PATH, '<script src="{}"></script>')
	write_php_includes(local_css, CSS_INCLUDES_PATH, '<link rel="stylesheet" href="{}">')

# ----------------------------------------
# after you’ve built `local_css` and `local_js`
# ----------------------------------------

import re
from pathlib import Path

# Path to your index.html (one level up)
INDEX_HTML = Path(__file__).resolve().parent / 'index.html'

def replace_block(html: str, marker: str, new_lines: str) -> str:
	"""
	Replaces everything between <!-- marker begin --> and <!-- marker end -->
	(inclusive) with the same markers plus new_lines in between.
	"""
	pattern = re.compile(
		rf'<!--\s*{marker}\s+begin\s*-->[\s\S]*?<!--\s*{marker}\s+end\s*-->',
		flags=re.IGNORECASE
	)
	replacement = (
		f'<!-- {marker} begin -->\n'
		f'{new_lines.rstrip()}\n'
		f'<!-- {marker} end -->'
	)
	return pattern.sub(replacement, html)

def inject_includes():
	# 0) Re-read load_order so local_css/local_js are in scope
	local_js, remote_js, local_css, remote_css = read_load_order()

	# 1) Read the original HTML
	html = INDEX_HTML.read_text(encoding='utf-8')

	# 2) Build the CSS snippet
	css_tags = '\n'.join(
		f'<link rel="stylesheet" href="{css_path}">'
		for css_path in local_css
	)

	# 3) Build the JS snippet
	js_tags = '\n'.join(
		f'<script src="{js_path}"></script>'
		for js_path in local_js
	)

	# 4) Replace blocks
	html = replace_block(html, 'jest_css', css_tags)
	html = replace_block(html, 'jest_js',  js_tags)

	# 5) Write it back
	INDEX_HTML.write_text(html, encoding='utf-8')
	print(f'[✓] Injected CSS/JS into {INDEX_HTML}')

# And at the end of your main():
if __name__ == '__main__':
	main()              # existing logic
	inject_includes()   # new step
