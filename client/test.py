import subprocess
p = subprocess.Popen(['node','main.js',"a","b"],stdout=subprocess.PIPE)
print p.communicate()[0];
'''while True:
    try:
        cmd = raw_input(":");
        p.communicate(input=cmd)[0]
    except Exception as e:
        print e;
'''
