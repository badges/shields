"""This module contains service definions for Badgr.co.

Service functions should take three strings (first, second, color) and return
three strings (first, second, and color).

    first - the first path part => the first word on the shield
    second - the second path part => the second word on the shield
    color - a color name, the background behind the second word on the shield

"""
import os
import time
from urllib import quote, urlopen

from aspen import json
from shields_io.colors import RED, YELLOW, YELLOWGREEN, GREEN, LIGHTGRAY


def _test(first, second, color):
    """For testing.
    """
    time.sleep(2)
    if second == "random":
        base = os.environ['CANONICAL_HOST']
        url = base + "/random.txt"
        second = urlopen(url).read().strip()
    return first, second, color


def noop(first, second, color):
    return first, second, color


def coveralls(first, second, color):
    first = "coverage"
    url = "https://coveralls.io/repos/%s/badge.png?branch=master"
    fp = urlopen(url % second)
    try:
        # We get a redirect to an S3 URL.
        score = fp.url.split('_')[1].split('.')[0]
        second = score + '%'

        as_number = int(score)
        if as_number < 80:
            color = RED
        elif as_number < 90:
            color = YELLOW
        else:
            color = GREEN
    except (IndexError, ValueError):
        second = 'n/a'
        color = LIGHTGRAY

    return first, second, color


def gittip(first, second, color):
    first = "tips"
    fp = urlopen("https://www.gittip.com/%s/public.json" % second)
    receiving = float(json.loads(fp.read())['receiving'])
    second = "$%d / week" % receiving
    if receiving == 0:
        color = RED
    elif receiving < 10:
        color = YELLOW
    elif receiving < 100:
        color = YELLOWGREEN
    else:
        color = GREEN

    return first, second, color


def travis_ci(first, second, color):
    first = "build"

    url = 'https://api.travis-ci.org/repos?slug=%s' % quote(second)
    fp = urlopen(url)
    repos = json.loads(fp.read())
    if repos:
        status = repos[0].get('last_build_status', 'n/a')
    else:
        status = 'n/a'

    second = { 0: 'passing'
             , 1: 'failing'
             , None: 'pending'
             , 'n/a': 'n/a'
              }.get(status, 'n/a')

    color = { 'failing': RED
            , 'passing': GREEN
            , 'pending': YELLOW
             }.get(second, LIGHTGRAY)

    return first, second, color


services = {}
services['_test'] = _test
services['coveralls'] = coveralls
services['gittip'] = gittip
services['travis-ci'] = travis_ci

def get(first):
    return services.get(first, noop)
