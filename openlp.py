#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# vim: autoindent shiftwidth=4 expandtab textwidth=120 tabstop=4 softtabstop=4

###############################################################################
# OpenLP - Open Source Lyrics Projection                                      #
# --------------------------------------------------------------------------- #
# Copyright (c) 2008-2017 OpenLP Developers                                   #
# --------------------------------------------------------------------------- #
# This program is free software; you can redistribute it and/or modify it     #
# under the terms of the GNU General Public License as published by the Free  #
# Software Foundation; version 2 of the License.                              #
#                                                                             #
# This program is distributed in the hope that it will be useful, but WITHOUT #
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or       #
# FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for    #
# more details.                                                               #
#                                                                             #
# You should have received a copy of the GNU General Public License along     #
# with this program; if not, write to the Free Software Foundation, Inc., 59  #
# Temple Place, Suite 330, Boston, MA 02111-1307 USA                          #
###############################################################################

import sys
import os
import multiprocessing
import PyQt5

from openlp.core.common import is_win, is_macosx
from openlp.core import main


if __name__ == '__main__':
    """
    Instantiate and run the application.
    """
    # Add support for using multiprocessing from frozen Windows executable (built using PyInstaller),
    # see https://docs.python.org/3/library/multiprocessing.html#multiprocessing.freeze_support
    if is_win():
        multiprocessing.freeze_support()
        qt_platform_plugins_path = (os.path.join(os.path.dirname(PyQt5.__file__), "plugins"))
        os.environ['QT_QPA_PLATFORM_PLUGIN_PATH'] = qt_platform_plugins_path
    # Mac OS X passes arguments like '-psn_XXXX' to the application. This argument is actually a process serial number.
    # However, this causes a conflict with other OpenLP arguments. Since we do not use this argument we can delete it
    # to avoid any potential conflicts.
    if is_macosx():
        sys.argv = [x for x in sys.argv if not x.startswith('-psn')]
    main()