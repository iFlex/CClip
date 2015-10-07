import easygui

def login():
    user = easygui.enterbox("Username","Login");
    password = easygui.passwordbox();
    return (user,password)

def askFileName():
    return easygui.fileopenbox();

def askInput(title):
    return easygui.enterbox(title,"");
