### Tutorials

- [Configuration example on Apache](installaction/apache2)
- [Configuration example on Nginx](installaction/nginx)
- [Quick Installation on CentOS](installaction/centos)
- [Defunct: Quick Installation on Docker](installaction/docker)
- [Quick Installation on Ubuntu](installaction/ubuntu)

### General Installation Guide

To install simply place the contents of the system in a web accessible
folder.

Note: _Currently the system is only tested on real servers based on Unix or WinNT filesystem._
_Use on a local WAMP package will most likely cause pathing issues._

**Ensure that the following have write capabilities:**

    /config.php
    /data
    /workspace
    /plugins
    /themes
    
Navigate in your browser to the URL where the system is placed and the
installer screen will appear. If any dependencies have not been met the
system will alert you.

Enter the requested information to create a user account, project, and
set your timezone and submit the form. If everything goes as planned 
you will be greeted with a login screen.

**(Optional Installation Settings)**

For a proper usage of the marketplace you need to set the following parameter

    allow_url_fopen On
    newrelic.enabled Off (only for newrelic users)

and the following extensions to be loaded

    ZIP
    OPENSSL
    MBSTRING

Note: Atheos will also work without these enabled.

sudo apt install apache2
sudo apt install php7.2 libapache2-mod-php7.2
sudo apt-get install php7.2-zip
sudo apt-get install php7.2-mbstring