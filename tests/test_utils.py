from unittest import TestCase

from shields_io.utils import collapse_path_parts


class TestCollapsePathParts(TestCase):

    def test_doesnt_collapse_nothing(self):
        assert collapse_path_parts("") == ""

    def test_doesnt_collapse_root(self):
        assert collapse_path_parts("/") == "/"

    def test_doesnt_collapse_one_part(self):
        assert collapse_path_parts("/foo.html") == "/foo.html"

    def test_doesnt_collapse_one_dir(self):
        assert collapse_path_parts("/foo/") == "/foo/"

    def test_doesnt_collapse_two_parts(self):
        assert collapse_path_parts("/foo/bar.html") == "/foo/bar.html"

    def test_collapses_path_parts(self):
        assert collapse_path_parts("/foo/bar/baz.html") == "/foo/bar%2Fbaz.html"

    def test_collapses_third_dir(self):
        assert collapse_path_parts("/foo/bar/baz/") == "/foo/bar%2Fbaz%2F"

    def test_collapses_multiple_path_parts(self):
        assert collapse_path_parts("/foo/bar/baz/buz.html") == "/foo/bar%2Fbaz%2Fbuz.html"

    def test_collapses_fourth_dir(self):
        assert collapse_path_parts("/foo/bar/baz/buz/") == "/foo/bar%2Fbaz%2Fbuz%2F"
