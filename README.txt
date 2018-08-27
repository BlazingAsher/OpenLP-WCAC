OpenLP
======

You're probably reading this because you've just downloaded the source code for
OpenLP. If you are looking for the installer file, please go to the download
page on the web site::

    http://openlp.org/download

If you're looking for how to contribute to OpenLP, then please look at the
OpenLP wiki::

    http://wiki.openlp.org/

Thanks for downloading OpenLP!

Modifications
=============

- Packaged WCAC logo with the program
- Added option to hide the author of a song
- Changed support links and email to mine

WCAC Notes
==========

1. You must install Python 3.4.4
2. Required modules (install via pip): sqlalchemy alembic chardet beautifulsoup4 Mako nose mock websockets asyncio waitress six webob requests
3. Install the following whl files with pip (located in resources/dependencies/wheel): lxml, PyICU, pyodbc
4. Install PyQt5 (located in resources/dependencies)
5. For PowerPoint support, install pypiwin32 version 219 (pip install pypiwin32==219)
6. For MySQL support, install mysql-connector-python (not needed)
7. For PostreSQL support, install psycopg2 (not needed)
8. All done!
