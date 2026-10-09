from pathlib import Path
import base64,json,zipfile,re
root=Path(__file__).parent
p=root/'dist'
mods={'three':'vendor/three.module.js','orbit-controls':'vendor/OrbitControls.js','gltf-exporter':'vendor/GLTFExporter.js','texture-utils':'vendor/TextureUtils.js','boat-model':'model.js'}
replace={"'./vendor/three.module.js'":"'three'","'./three.module.js'":"'three'","'./vendor/OrbitControls.js'":"'orbit-controls'","'./vendor/GLTFExporter.js'":"'gltf-exporter'","'./TextureUtils.js'":"'texture-utils'","'./model.js'":"'boat-model'"}
def norm(s):
 for a,b in replace.items():s=s.replace(a,b)
 return s
mapping={name:'data:text/javascript;base64,'+base64.b64encode(norm((p/path).read_text()).encode()).decode() for name,path in mods.items()}
html=(p/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(p/'style.css').read_text()+'</style>')
html=html.replace('<script type="module" src="app.js"></script>','<script type="importmap">'+json.dumps({'imports':mapping})+'</script><script type="module">'+norm((p/'app.js').read_text())+'</script>')
# Standalone export links use embedded bytes so the downloaded file works without the server.
glb=(p/'downloads/Catalina22_Original.glb').read_bytes();html=html.replace('href="downloads/Catalina22_Original.glb"','href="data:model/gltf-binary;base64,'+base64.b64encode(glb).decode()+'"')
html=re.sub(r'<a class="download-card" href="downloads/Catalina22_Viewer_Offline.html".*?</a>','',html,flags=re.S)
html=re.sub(r'<a class="download-card" href="downloads/Catalina22_Model_Source.zip".*?</a>','',html,flags=re.S)
(p/'downloads/Catalina22_Viewer_Offline.html').write_text(html)
with zipfile.ZipFile(p/'downloads/Catalina22_Model_Source.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(root.rglob('*')):
  rel=f.relative_to(root)
  if not f.is_file() or '.git' in rel.parts or '.openai' in rel.parts or 'downloads' in rel.parts or f.name.endswith('.tar.gz'):continue
  if rel.parts[0] not in ['dist','docs','scripts','model-data','changes','.github','README.md','AGENTS.md','CHANGELOG.md','export-model.mjs','package.json','package.py','netlify.toml','.gitignore']:continue
  z.write(f,rel)
 z.write(p/'downloads/Catalina22_Original.glb','dist/downloads/Catalina22_Original.glb')
 z.write(p/'downloads/Catalina22_Viewer_Offline.html','dist/downloads/Catalina22_Viewer_Offline.html')
print('Packaged GLB, source ZIP, and standalone offline viewer.')
