from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder(path, size, bg_color, text, text_color):
    img = Image.new('RGBA', size, bg_color)
    draw = ImageDraw.Draw(img)
    # Basic text centering without font loading to avoid cross-platform issues
    w, h = size
    # Just draw a simple rect to make it look like an icon
    draw.rectangle([w*0.2, h*0.2, w*0.8, h*0.8], fill=text_color)
    img.save(path)

# Services (200x200)
services = [
    ('cleaning.png', '#FFF8E1', '#FFE082'),
    ('electrician.png', '#FFEBEE', '#FFCDD2'),
    ('plumbing.png', '#E3F2FD', '#90CAF9'),
    ('painting.png', '#E8F5E9', '#A5D6A7'),
    ('gardening.png', '#FCE4EC', '#F48FB1'),
    ('appliances.png', '#F5F5F5', '#E0E0E0')
]
for name, bg, fg in services:
    create_placeholder(f"src/assets/services/{name}", (200, 200), bg, name.split('.')[0], fg)

# Experts (200x200)
experts = [
    ('rajesh.png', '#E3F2FD', '#1976D2'),
    ('arjun.png', '#FFEBEE', '#D32F2F')
]
for name, bg, fg in experts:
    create_placeholder(f"src/assets/experts/{name}", (200, 200), bg, name.split('.')[0], fg)

# Banners and illustrations
create_placeholder("src/assets/banners/onam_banner.png", (800, 300), '#2E7D32', 'Onam Banner', '#FF6F00')
create_placeholder("src/assets/illustrations/otp_illustration.png", (400, 300), '#FCE4EC', 'OTP Hand', '#F48FB1')
create_placeholder("src/assets/illustrations/confirmed_bg.png", (400, 300), '#E8F5E9', 'Confirmed BG', '#A5D6A7')
create_placeholder("src/assets/illustrations/map_bg.png", (400, 200), '#E0F7FA', 'Map', '#80DEEA')

print("Placeholders generated successfully.")
