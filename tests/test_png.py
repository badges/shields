from __future__ import division, print_function, unicode_literals

import os
from unittest import TestCase

from aspen.website import Website
from aspen.testing.client import TestClient


PROJECT_ROOT = os.path.realpath(os.path.join(os.path.dirname(__file__), b'..'))
WWW_ROOT = os.path.realpath(os.path.join(PROJECT_ROOT, b'www'))


class TestPNGs(TestCase):

    def setUp(self):
        website = Website([ '--www_root', WWW_ROOT
                          , '--project_root', PROJECT_ROOT
                          , '--show_tracebacks', b'yes'
                           ])
        self.client = TestClient(website)

    def test_we_can_serve_a_png(self):
        response = self.client.get('/cheeze/whiz.png')
        assert response.body[1:4] == b'PNG'
