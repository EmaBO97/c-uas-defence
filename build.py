import base64, glob, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
s = open('src.html', encoding='utf-8').read()
js = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob('js/*.js')))
s = s.replace('/*JS*/', js)
fr = base64.b64encode(open('fonts/P-Regular.woff2', 'rb').read()).decode()
fm = base64.b64encode(open('fonts/P-Medium.woff2', 'rb').read()).decode()
s = s.replace('/*FONTS*/', f'@font-face {{ font-family: "Poppins"; font-weight: 400; font-display: swap; src: url(data:font/woff2;base64,{fr}) format("woff2"); }}\n@font-face {{ font-family: "Poppins"; font-weight: 500 700; font-display: swap; src: url(data:font/woff2;base64,{fm}) format("woff2"); }}')
te = s.index('</title>') + 8; se = s.index('</style>') + 8
doc = '<!doctype html>\n<html lang="it">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' + s[:te] + '\n' + s[te:se] + '\n</head>\n<body>\n' + s[se:] + '\n</body>\n</html>\n'
open('test.html', 'w', encoding='utf-8').write(doc)
hook = [l for l in doc.split('\n') if l.startswith('window.__g')][0]
final = doc.replace(hook + '\n', '')
open('difesa-c-uas.html', 'w', encoding='utf-8').write(final)
open('index.html', 'w', encoding='utf-8').write(final)  # per GitHub Pages
print('ok', len(doc) // 1024, 'KB')
