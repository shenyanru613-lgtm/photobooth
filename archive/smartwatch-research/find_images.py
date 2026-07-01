import sys, json, re

with open(sys.argv[1], 'r', encoding='utf-8') as f:
    d = json.load(f)

content = d['data']['document']['content']
imgs = re.findall(r'<img[^>]*id="([^"]+)"[^>]*name="([^"]*)"[^>]*>', content)
for img_id, name in imgs:
    idx = content.find(f'id="{img_id}"')
    before = content[max(0,idx-400):idx]
    headings = re.findall(r'<(h[23])[^>]*id="([^"]+)"[^>]*>([^<]+)</\1>', before)
    if headings:
        last_h = headings[-1]
        print(f'{name}: block={img_id} -> near "{last_h[2]}" ({last_h[1]})')
