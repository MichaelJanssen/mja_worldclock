#! /usr/bin/env python3
# -*- coding: utf-8 -*-
"""usage: %prog

retrieve coords of timezone towns

https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

-> parse entries
-> parse coordinates into decimal
-> write json coords.js

or more complicated with the api for each timezone town:
https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=0&titles=Abidjan|Accra

"""
import sys, os, time, re, datetime
from pprint import pprint
import json

from mja.cache import webcache
webcache.cache_time = 86400 # not supported

def main():
    fs = webcache.request('https://en.wikipedia.org/wiki/List_of_tz_database_time_zones');
    reg = (
        '<tr>\s*'
        '<td>\s*<a[^>]*>(?P<country_code>..)</a>\s*</td>\s*'
        '<td>(?P<lat_lon>[^<]*)</td>\s*'
        '<td>\s*<a[^>]*>(?P<code>[^<]*)</a>\s*</td>\s*'
        )
    tr = re.findall(reg, fs, re.DOTALL)
    if not tr:
        tr = re.findall(r'<tr>.*?</tr>', fs, re.DOTALL);
        clog(tr[0])

    tr = [[x.strip() for x in elem] for elem in tr]
    data = {}
    for country_code, lat_lon, code in tr:
        if not lat_lon: continue
        data[code] = parse_lat_long(lat_lon)
    fs = json.dumps(data, indent=2)
    with open('coords.js', 'w') as fo:
        fo.write("lat_lon = %s" % fs)
        print('Written to: %s' % fo.name)

def parse_lat_long(s):
    # +1328+14445
    lat_sign = s[0]
    lat_digits = ''
    n = 1
    while s[n].isdigit():
        lat_digits += s[n]
        n += 1
    lon_sign = s[n]
    lon_digits = ''
    n += 1
    while s[n].isdigit():
        lon_digits += s[n]
        n += 1
        if n >= len(s): break
    # print(hex(ord(lat_sign)))
    if lat_sign == '\u2212': lat_sign = '-'
    if lat_sign == '\u002b': lat_sign = '+'
    if lon_sign == '\u2212': lon_sign = '-'
    if lon_sign == '\u002b': lon_sign = '+'
    # un-sexagesimalize
    lat = unsexagesimalize(lat_digits, 2)
    lon = unsexagesimalize(lon_digits, 3)
    return ("%s%s,%s%s" % (lat_sign, lat, lon_sign, lon))

def unsexagesimalize(s, deg_digits):
    """
    #>>> unsexagesimalize('122254.899', 2)
    #12.381667
    >>> unsexagesimalize('122254', 2)
    12.381667
    >>> unsexagesimalize('1222', 2)
    12.366667
    """
    deg = int(s[:deg_digits])
    min_ = s[deg_digits:deg_digits+2]
    sec = s[deg_digits+2:deg_digits+4]
    frac = s[deg_digits+5:]
    if min_:
        min_ = int(min_) / 60
    else:
        min_ = 0
    if sec:
        sec = int(sec) / 3600
    else:
        sec = 0
    if frac:
        frac = int(frac) / 3600
    else:
        frac = 0
    ret = deg + min_ + sec + frac
    ret = round(ret, 6)
    return ret

import string
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description=__doc__.strip(), formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("-d", "--debug", action="store_true", help="debugging output")
    parser.add_argument("-v", "--verbose", action="count", default=0, help="verbose output")
    parser.add_argument("--test", action="store_true", help="run doctests")
    # nargs:
    #  None: required (as in: the argument is required, the option is not)
    #  ?: optional
    #  *: optional list
    #  +: required list
    #  1-N: required list of 1-N items. Perhaps 0-N allowed?
    #parser.add_argument("--exclude", nargs='+', action="store", help="exclude file-names")
    #parser.add_argument("filename", nargs=None, help="file to read")
    #parser.add_argument("search", nargs='*', help="search words")

    opt = parser.parse_args()
    args = None # now opt.search etc

    if opt.test:
        import doctest
        doctest.testmod()
    else:
        main()
