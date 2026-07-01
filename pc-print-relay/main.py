"""
AI Photo Booth — PC Print Relay Service
=========================================
Runs on the PC connected to printers. Listens for print jobs from the cloud
backend and prints them to the system printer (Canon / Inkjet).

Usage:
  1. Install dependencies: pip install -r requirements.txt
  2. Set BACKEND_URL in .env (or pass via command line)
  3. Run: python main.py

The app sits in the system tray. Right-click to quit.
"""

import os
import sys
import json
import time
import tempfile
import threading
import subprocess
import urllib.request
from pathlib import Path
from io import BytesIO

# ===================== Configuration =====================

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:3001")
PRINTER_NAME = os.environ.get("PRINTER_NAME", "")  # Empty = system default
STICKER_SIZES = {
    "sticker_small": {"w_mm": 57, "h_mm": 57},
    "keychain": {"w_mm": 30, "h_mm": 30},
    "sticker_large": {"w_mm": 76, "h_mm": 76},
    "card": {"w_mm": 100, "h_mm": 148},
}

# ===================== Dependencies Check =====================

def check_deps():
    """Check and report missing dependencies."""
    missing = []
    try:
        import socketio
    except ImportError:
        missing.append("python-socketio[client]")
    try:
        from PIL import Image
    except ImportError:
        missing.append("Pillow")
    try:
        import win32print
        import win32ui
    except ImportError:
        missing.append("pywin32")

    if missing:
        print("=" * 50)
        print("MISSING DEPENDENCIES. Please run:")
        print(f"  pip install {' '.join(missing)}")
        print("=" * 50)
        sys.exit(1)

check_deps()

import socketio
from PIL import Image, ImageDraw, ImageFont
import win32print
import win32ui

# ===================== Printer Functions =====================

def list_printers():
    """List all available printers."""
    printers = win32print.EnumPrinters(
        win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
    )
    print("\n📋 Available printers:")
    for i, p in enumerate(printers):
        flags = p[2]
        name = p[1]
        print(f"  [{i}] {name}")
    return [p[1] for p in printers]


def get_printer():
    """Get the target printer name."""
    if PRINTER_NAME:
        return PRINTER_NAME
    return win32print.GetDefaultPrinter()


def create_print_layout(image_path, size_key="keychain"):
    """
    Create a print-ready layout from the generated image.
    Returns path to the print-ready file.
    """
    size = STICKER_SIZES.get(size_key, STICKER_SIZES["keychain"])
    img = Image.open(image_path).convert("RGB")

    # Calculate pixel dimensions at 300 DPI
    dpi = 300
    w_px = int(size["w_mm"] / 25.4 * dpi)
    h_px = int(size["h_mm"] / 25.4 * dpi)

    # Resize image to fit
    img = img.resize((w_px, h_px), Image.LANCZOS)

    # Draw a thin cut line (1px circle/rounded rect outline)
    draw = ImageDraw.Draw(img)
    margin = 4
    draw.rounded_rectangle(
        [margin, margin, w_px - margin, h_px - margin],
        radius=20, outline="lightgray", width=1,
    )

    # If keychain, make it a circle mask
    if size_key == "keychain":
        mask = Image.new("L", (w_px, h_px), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([0, 0, w_px, h_px], fill=255)
        # Apply mask
        bg = Image.new("RGB", (w_px, h_px), "white")
        bg.paste(img, (0, 0), mask)
        img = bg

    # Save to temp file
    out_path = tempfile.mktemp(suffix=".png")
    img.save(out_path, dpi=(dpi, dpi))
    return out_path


def print_image(file_path, printer_name=None, copies=1):
    """
    Print an image file using Windows print API.
    """
    if printer_name is None:
        printer_name = get_printer()

    print(f"🖨️  Printing to: {printer_name}")
    print(f"   File: {file_path}")
    print(f"   Copies: {copies}")

    # Method 1: Use ShellExecute (simplest, works with most printers)
    try:
        import ctypes
        SE_ERR_ACCESSDENIED = 5
        result = ctypes.windll.shell32.ShellExecuteW(
            None, "print", file_path, f'/d:"{printer_name}"', None, 0
        )
        if result > 32:
            print("✅ Print job sent via ShellExecute")
            return True
        else:
            print(f"⚠️  ShellExecute failed (code {result}), trying alternate method...")
    except Exception as e:
        print(f"⚠️  ShellExecute error: {e}")

    # Method 2: Use PIL + win32print directly
    try:
        hprinter = win32print.OpenPrinter(printer_name)
        try:
            # Start a print job
            job_id = win32print.StartDocPrinter(
                hprinter, 1, ("AI Photo Booth Sticker", None, "RAW")
            )
            win32print.StartPagePrinter(hprinter)

            # Read image and send as raw
            img = Image.open(file_path).convert("RGB")
            img_bytes = BytesIO()
            img.save(img_bytes, format="PNG")
            img_bytes.seek(0)

            # Write raw image bytes
            win32print.WritePrinter(hprinter, img_bytes.read())

            win32print.EndPagePrinter(hprinter)
            win32print.EndDocPrinter(hprinter)
            print(f"✅ Print job sent via win32print (Job ID: {job_id})")
            return True
        finally:
            win32print.ClosePrinter(hprinter)
    except Exception as e:
        print(f"❌ win32print method failed: {e}")
        return False


def download_and_print(print_job):
    """
    Download the generated image and print it.
    """
    job_id = print_job.get("jobId", "unknown")
    image_url = print_job.get("imageUrl")
    size = print_job.get("size", "keychain")
    copies = print_job.get("copies", 1)
    style_name = print_job.get("styleName", "Unknown")

    if not image_url:
        print(f"❌ No image URL in print job {job_id}")
        return

    print(f"\n{'='*50}")
    print(f"📬 Print Job: {job_id}")
    print(f"   Style: {style_name}")
    print(f"   Size: {size}")
    print(f"   Copies: {copies}")
    print(f"   URL: {image_url}")

    # Download
    try:
        temp_file = tempfile.mktemp(suffix=".png")
        urllib.request.urlretrieve(image_url, temp_file)
        print(f"📥 Downloaded to: {temp_file}")
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return

    # Layout
    try:
        layout_file = create_print_layout(temp_file, size)
        print(f"🎨 Layout created: {layout_file}")
    except Exception as e:
        print(f"⚠️  Layout failed (using original): {e}")
        layout_file = temp_file

    # Print
    success = print_image(layout_file, copies=copies)

    # Cleanup
    try:
        os.unlink(temp_file)
        if layout_file != temp_file:
            os.unlink(layout_file)
    except:
        pass

    return success


# ===================== WebSocket Client =====================

sio = socketio.Client(reconnection=True, reconnection_attempts=0, reconnection_delay=5)


@sio.on("connect")
def on_connect():
    print(f"✅ Connected to backend: {BACKEND_URL}")
    # Register as print relay
    computer_name = os.environ.get("COMPUTERNAME", "PhotoBooth-PC")
    sio.emit("register_print_relay", {
        "name": computer_name,
        "printers": [get_printer()],
    })
    print(f"🖨️  Registered as print relay: {computer_name}")


@sio.on("disconnect")
def on_disconnect():
    print("❌ Disconnected from backend. Will auto-reconnect...")


@sio.on("print_job")
def on_print_job(data):
    """Receive print job from backend."""
    try:
        success = download_and_print(data)
        job_id = data.get("jobId", "unknown")
        if success:
            sio.emit("print_done", {"jobId": job_id})
        else:
            sio.emit("print_error", {"jobId": job_id, "error": "Print failed"})
    except Exception as e:
        print(f"❌ Error processing print job: {e}")
        sio.emit("print_error", {
            "jobId": data.get("jobId", "unknown"),
            "error": str(e),
        })


# ===================== System Tray (Windows) =====================

def create_tray_icon():
    """Create a system tray icon for the print relay."""
    try:
        import pystray
        from pystray import MenuItem, Menu

        def on_quit(icon, item):
            icon.stop()
            sio.disconnect()
            os._exit(0)

        # Create a simple colored icon
        icon_image = Image.new("RGB", (64, 64), "#6366f1")
        draw = ImageDraw.Draw(icon_image)
        draw.ellipse([16, 8, 48, 40], fill="white")
        draw.rectangle([24, 36, 40, 52], fill="white")

        menu = Menu(
            MenuItem("🖨️  AI Photo Booth - Print Relay", None, enabled=False),
            Menu.SEPARATOR,
            MenuItem(
                "📋 Printers",
                Menu(
                    *[MenuItem(f"  {p}", None, enabled=False) for p in list_printers()],
                ),
            ),
            Menu.SEPARATOR,
            MenuItem("❌ Quit", on_quit),
        )

        icon = pystray.Icon("photobooth_print", icon_image, "AI Photo Booth", menu)
        return icon
    except ImportError:
        print("⚠️  pystray not installed. Running in console mode.")
        print("   Install with: pip install pystray")
        return None


# ===================== Main =====================

def main():
    print(r"""
╔══════════════════════════════════════╗
║   🖨️  AI Photo Booth Print Relay    ║
║   PC Print Service v1.0             ║
╚══════════════════════════════════════╝
    """)

    print(f"🔗 Backend: {BACKEND_URL}")
    print(f"🖨️  Default Printer: {get_printer()}")

    # List printers
    printers = list_printers()

    # Prompt for backend URL if default
    backend = input(f"\nBackend URL [{BACKEND_URL}]: ").strip()
    if backend:
        global BACKEND_URL
        BACKEND_URL = backend

    # Connect
    print(f"\nConnecting to {BACKEND_URL}...")
    try:
        sio.connect(BACKEND_URL)
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\nMake sure the backend server is running.")
        print(f"Start it with: cd photobooth-backend && npm run dev")
        input("\nPress Enter to retry...")
        main()
        return

    # Try system tray, fall back to console
    tray = create_tray_icon()
    if tray:
        print("\n📌 Print relay running in system tray. Right-click to quit.")
        # Run socketio in background thread
        threading.Thread(target=sio.wait, daemon=True).start()
        tray.run()
    else:
        print("\n📌 Print relay running. Press Ctrl+C to quit.")
        print("   Waiting for print jobs...\n")
        try:
            sio.wait()
        except KeyboardInterrupt:
            print("\n👋 Shutting down...")
            sio.disconnect()


if __name__ == "__main__":
    main()
