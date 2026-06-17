import json
import os
import base64
import re
from urllib.parse import urlparse

# --- CONFIGURACIÓN ---
har_file_path = '/var/www/html/falcon.har' 
output_dir = './original-scraped'
target_domain = 'falconreact.prium.me'
# ---------------------

print("Leyendo y reparando archivo HAR dinámicamente...")

with open(har_file_path, 'r', encoding='utf-8', errors='ignore') as f:
    raw_content = f.read()

# Si el JSON se cortó mal, intentamos forzar un cierre estructural válido
if not raw_content.strip().endswith('}'):
    print("Detectado JSON truncado. Aplicando parches de emergencia...")
    # Buscamos la última entrada completa de un request antes del corte
    entries = re.findall(r'\{\s*"startedDateTime".*?\}\s*,\s*(?=\{\s*"startedDateTime")', raw_content, re.DOTALL)
    if not entries:
        # Intento secundario si es la última del arreglo
        entries = re.findall(r'\{\s*"startedDateTime".*?\}\s*(?=\s*\])', raw_content, re.DOTALL)
    
    if entries:
        print(f"Se lograron recuperar {len(entries)} peticiones completas del bloque dañado.")
        har_data = {"log": {"entries": []}}
        for entry in entries:
            try:
                # Nos aseguramos de que cada entrada sea un JSON válido individualmente
                har_data['log']['entries'].append(json.loads(entry.rstrip(',')))
            except:
                continue
    else:
        # Plan C: Si fallan las expresiones regulares, limpiamos el final del string rústicamente
        print("Estructurando terminación rústica del buffer...")
        fixed_content = raw_content
        # Eliminamos comillas abiertas o caracteres rotos al final
        fixed_content = re.sub(r',[^,]*$', '', fixed_content)
        # Forzamos cierres de llaves y corchetes para que json.loads no muera
        for closure in [ '}', ']', '}', '}' ]:
            try:
                har_data = json.loads(fixed_content)
                print("¡Estructura JSON rescatada con éxito!")
                break
            except:
                fixed_content += closure
else:
    har_data = json.loads(raw_content)

# --- PROCESAMIENTO DE ENTRADAS ---
count = 0
for entry in har_data.get('log', {}).get('entries', []):
    request = entry.get('request', {})
    response = entry.get('response', {})
    url = request.get('url', '')
    
    parsed_url = urlparse(url)
    if parsed_url.netloc != target_domain:
        continue
        
    path = parsed_url.path
    if not path or path == '/':
        path = '/index.html'
        
    local_path = os.path.join(output_dir, path.lstrip('/'))
    local_dir = os.path.dirname(local_path)
    
    if not os.path.exists(local_dir):
        os.makedirs(local_dir)
        
    content_data = response.get('content', {})
    if 'text' in content_data:
        text = content_data['text']
        try:
            print(f"Extrayendo: {path}")
            if content_data.get('encoding') == 'base64':
                with open(local_path, 'wb') as out_file:
                    out_file.write(base64.b64decode(text))
            else:
                with open(local_path, 'w', encoding='utf-8') as out_file:
                    out_file.write(text)
            count += 1
        except Exception as e:
            pass

print(f"\n¡Extracción completada! Se guardaron {count} recursos correctamente.")
