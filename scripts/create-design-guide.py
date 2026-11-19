"""Build the printable design sheet from the same CSS tokens as the website.
Run with a Python environment containing reportlab. Pass Inter TTF paths as args.
"""
from pathlib import Path
import re, sys, shutil
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.utils import ImageReader
from reportlab.lib.utils import simpleSplit

ROOT = Path(__file__).resolve().parents[1]
if len(sys.argv) != 3:
 raise SystemExit('Usage: create-design-guide.py /path/to/Inter-Regular.ttf /path/to/Inter-Semibold.ttf')
regular, medium = sys.argv[1:]
pdfmetrics.registerFont(TTFont('Inter', regular))
pdfmetrics.registerFont(TTFont('InterMedium', medium))
css = (ROOT/'src/styles/tokens.css').read_text()
light_block, dark_block = css.split(':root[data-theme=')
colors = lambda s: dict(re.findall(r'--([\w-]+):\s*(#[\da-fA-F]{6})', s))
light, dark = colors(light_block), colors(dark_block.split(':root {')[0])
W,H = landscape(A3)
M=42; GAP=28; CW=(W-2*M-2*GAP)/3
out=ROOT/'design-guide/tobias-klein-design-guide.pdf'
out.parent.mkdir(parents=True, exist_ok=True)
c=canvas.Canvas(str(out),pagesize=(W,H))
c.setTitle('Tobias Klein - Photography & Projects - Design Guide')
c.setAuthor('Tobias Klein')
INK=HexColor(light['ink']);QUIET=HexColor(light['quiet']);LINE=HexColor(light['line'])
def text(x,y,s,size=10.5,font='Inter',color=INK):
 c.setFillColor(color);c.setFont(font,size);c.drawString(x,y,s)
def paragraph(x,y,s,width=CW,size=10.5,leading=15,color=QUIET):
 for line in simpleSplit(s,'Inter',size,width):
  text(x,y,line,size,color=color);y-=leading
 return y
def rule(x,y,width=CW):
 c.setStrokeColor(LINE);c.setLineWidth(.6);c.line(x,y,x+width,y)
def label(x,y,s):text(x,y,s.upper(),8.5,'InterMedium',QUIET)
def spec(x,y,name,body):
 text(x,y,name,10.5,'InterMedium');return paragraph(x,y-17,body,size=10,leading=14)-14
c.setFillColor(HexColor(light['paper']));c.rect(0,0,W,H,fill=1,stroke=0)
label(M,H-43,'Tobias Klein / Photography & personal projects')
text(M,H-94,'A quieter frame.',38,'InterMedium')
paragraph(M,H-120,'A shared visual language: neutral foundations, clear typography, and room for the work.',W-2*M,12,17)
text(W-M-130,H-43,'DESIGN GUIDE  /  V1.0',9,'InterMedium',QUIET)
rule(M,H-147,W-2*M)
# Paired theme panels make the neutral palette explicit in one glance.
PW=(W-2*M-20)/2; PY=H-310; PH=140
roles=[('paper','Canvas'),('ink','Text'),('quiet','Secondary'),('line','Dividers'),('soft','Surface'),('accent-ink','Interactive')]
for index,(name,pal) in enumerate([('Light',light),('Dark',dark)]):
 x=M+index*(PW+20)
 c.setFillColor(HexColor(pal['paper']));c.setStrokeColor(HexColor(pal['line']));c.rect(x,PY,PW,PH,fill=1,stroke=1)
 text(x+16,PY+PH-24,name,14,'InterMedium',HexColor(pal['ink']))
 sw=(PW-32-5*10)/6
 for i,(token,caption) in enumerate(roles):
  sx=x+16+i*(sw+10)
  c.setFillColor(HexColor(pal[token]));c.setStrokeColor(HexColor(pal['line']));c.rect(sx,PY+52,sw,40,fill=1,stroke=1)
  text(sx,PY+34,caption,8,color=HexColor(pal['ink']))
  text(sx,PY+19,pal[token].upper(),8,color=HexColor(pal['quiet']))
Y=PY-32
# Typography column.
x=M
label(x,Y,'Typography');text(x,Y-30,'Inter, throughout.',23,'InterMedium')
y=paragraph(x,Y-54,'One locally hosted family. Let scale and weight create hierarchy; keep body text calm.')-21
text(x,y,'Looking closer.',28,'InterMedium');y-=30
text(x,y,'Regular 400   /   Medium 500   /   Semibold 600',9,color=QUIET);y-=25
for name,body in [('Hero','48-115 px / weight 500 / line height 1.03'),('Page title','45-64 px / weight 400 / line height 1.08'),('Section title','30-42 px / weight 400 / line height 1.2'),('Body','16 px / weight 400 / line height 1.65'),('Navigation and links','14 px; keep interactive touch targets at least 44 px.'),('Supporting metadata','12-13 px. Use only for secondary information.')]:
 y=spec(x,y,name,body)
# Photography column.
x=M+CW+GAP
label(x,Y,'Photography');text(x,Y-30,'The image comes first.',23,'InterMedium')
y=Y-52
img=ImageReader(str(ROOT/'src/gallery/Landscape/DSC01267.jpg'))
ih=148; iw=215
c.setFillColor(HexColor('#ffffff'));c.rect(x,y-ih,iw,ih,fill=1,stroke=0)
c.saveState();p=c.beginPath();p.rect(x+7,y-ih+7,iw-14,ih-14);c.clipPath(p,stroke=0,fill=0)
c.drawImage(img,x+7,y-ih+7,width=iw-14,height=ih-14,mask='auto',preserveAspectRatio=True,anchor='c')
c.restoreState();y-=ih+24
for name,body in [('White photo mats','8 px selected work / 3 px gallery / 10 px lightbox. Keep borders white in both themes.'),('Compact gallery','Justified rows with 10 px gaps on desktop and 7 px on mobile. Preserve image proportions.'),('Selected work','All featured images, with curated choices first. Swipe or use previous/next; no autoplay.'),('Image information','Keep thumbnails quiet. Show the title and imported camera metadata inside the lightbox.')]:
 y=spec(x,y,name,body)
# Layout and behavior column.
x=M+2*(CW+GAP)
label(x,Y,'Layout & interaction');text(x,Y-30,'One visual rhythm.',23,'InterMedium')
y=Y-57
for name,body in [('Shared alignment','1200 px maximum content width. Outer margins: 48 px desktop / 24 px tablet / 20 px mobile.'),('Compact navigation','72 px desktop header; approximately 88 px on small screens. Keep Photography, Projects and About visible.'),('Spacing','Use a 4 px base: 4, 8, 12, 16, 24, 32, 48 and 64 px. Section breaks are generally 40-64 px.'),('Controls and focus','Monochrome text links, thin dividers and circular icon controls. Always show keyboard focus.'),('Motion','250 ms transitions / photo hover scale 1.02. Respect reduced-motion settings. No automatic slideshows.'),('Theme and future projects','Remember the chosen theme. Reuse these type, color, spacing and control foundations for cameraPhysics and future projects.')]:
 y=spec(x,y,name,body)
# A small footer deliberately distinguishes implementation source from the visual brief.
rule(M,57,W-2*M)
text(M,37,'19 NOVEMBER 2026  /  A3 LANDSCAPE REFERENCE SHEET',8.5,'InterMedium',QUIET)
text(W-M-390,37,'Source of truth: tokens.css + local design reference',8.5,color=QUIET)
c.showPage();c.save()

print(out)
