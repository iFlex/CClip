import views
import json
import Tkinter
import subprocess

def syncClipbd():
    filen = views.askFileName();

def sendClipbd():
    filen = views.askFileName();
    recipient = views.askInput("Username of recipient:");

def syncFile():
    filen = views.askFileName();

def sendFile():
    filen = views.askFileName();
    recipient = views.askInput("Username of recipient:");


identity = views.login();

p = subprocess.Popen(['node','../client/main.js',identity[0],identity[1]],stdout=subprocess.PIPE,stdin=subprocess.PIPE)
print p.communicate()[0]

window = Tkinter.Tk()
window.title(identity[0])

b = Tkinter.Button(text=identity[0]+" - logout");
b.pack(fill=Tkinter.X)

b = Tkinter.Button(text="Sync Clipboard",command=syncClipbd);
b.pack(fill=Tkinter.X)

b = Tkinter.Button(text="Send Clipboard",command=sendClipbd);
b.pack(fill=Tkinter.X)

b = Tkinter.Button(text="Sync File",command=syncFile);
b.pack(fill=Tkinter.X)

b = Tkinter.Button(text="Send File",command=sendFile);
b.pack(fill=Tkinter.X)

window.mainloop();
