import easygui
import sys
accept = easygui.ynbox(sys.argv[1]+" would like to send you "+sys.argv[2],"File Offer",("Accept","Decline"));
if accept:
    print easygui.filesavebox();
print ""
