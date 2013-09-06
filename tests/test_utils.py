from unittest import TestCase

from shields_io.utils import collapse_path_parts


class TestCollapsePathParts(TestCase):

    def test_passes_through_when_appropriate(self):
        assert collapse_path_parts("/foo/bar.html") == "/foo/bar.html"

    def test_collapses_path_parts(self):
        assert collapse_path_parts("/foo/bar/baz.html") == "/foo/bar%2Fbaz.html"
