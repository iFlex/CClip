import views
from subprocess import Popen, PIPE, STDOUT
import Tkinter


def syncFile():
    filen = views.askFileName();

def sendFile():
    filen = views.askFileName();
    recipient = views.askInput("Username of recipient:");

#p = Popen(['node','../client/main.js'], stdout=PIPE, stdin=PIPE, stderr=PIPE)
#while True:
#    cmd = raw_input("command:");
#    print p.communicate(input=cmd)[0];

identity = views.login();
#TODO: login

window = Tkinter.Tk()
window.title(identity[0])

b = Tkinter.Button(text=identity[0]+" - logout");
b.pack(fill=Tkinter.X)

b = Tkinter.Button(text="Sync File",command=syncFile);
b.pack(fill=Tkinter.X)

b = Tkinter.Button(text="Send File",command=sendFile);
b.pack(fill=Tkinter.X)

window.mainloop();
