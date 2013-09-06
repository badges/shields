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
        response = self.client.get("/cheeze/whiz.png")
        assert response.body[1:4] == b'PNG'

    def test_extra_slash_gets_collapsed(self):
        response = self.client.get("/foo/bar/baz.png")
        assert response.body[1:4] == 'PNG'

    def test_extra_slash_gets_passed_through_to_context(self):
        actual = self.client.get("/foo/bar/baz.png").request.context['path']['second']
        assert actual == 'bar/baz'

    def test_extra_slashes_end_up_as_one_slash(self):
        # This is actually an Aspen mis-feature, likely to change in the future:
        #  https://github.com/gittip/aspen-python/issues/170
        actual = self.client.get("/foo/bar/////baz.png").request.context['path']['second']
        assert actual == 'bar/baz'

    def test_2F_redirects(self):
        response = self.client.get("/foo/bar%2Fbaz.png")
        assert response.code == 302

    def test_2F_redirects_to_extra_slash(self):
        actual = self.client.get("/foo/bar%2Fbaz.png").headers['Location']
        assert actual == '/foo/bar/baz.png'

    def test_redirect_handles_multiple_slashes(self):
        actual = self.client.get("/foo/bar%2F%2Fba%2Fz.pn%2Fg").headers['Location']
        assert actual == '/foo/bar//ba/z.pn/g'
