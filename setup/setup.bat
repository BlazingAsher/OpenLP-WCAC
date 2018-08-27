IF NOT EXIST C:\Python34 GOTO NOWINDIR
C:\Python34\python.exe -m pip install --user virtualenv
C:\Python34\python.exe -m virtualenv ..\env

call ..\env\Scripts\activate.bat
pip install sqlalchemy 
pip install alembic chardet beautifulsoup4 Mako nose mock websockets asyncio waitress six webob requests
pip install pypiwin32==219
pip install ../resources/dependencies/whl/lxml-4.2.4-cp34-cp34m-win32.whl
pip install ../resources/dependencies/whl/PyICU-2.0.6-cp34-cp34m-win32.whl
pip install ../resources/dependencies/whl/pyodbc-4.0.24-cp34-cp34m-win32.whl

robocopy .\PyQt5 ..\env\Lib\site-packages\PyQt5 /s /e 
copy .\sip.pyd ..\env\Lib\site-packages /y

python ../openlp.py

:NOWINDIR
echo Python 3.4.4 is not installed!
pause