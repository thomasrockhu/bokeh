from __future__ import absolute_import, print_function

import yaml

from ..properties import HasProps

# whenever we cache that there's nothing themed for a class, we
# use this same dict instance, so we don't have a zillion empty
# dicts in our caches.
_empty_dict = dict()

class Theme(object):
    def __init__(self, filename=None, json=None):
        if filename is not None:
            if json is not None:
                raise ValueError("Theme should be constructed from a file or from json not both")
            f = open(filename)
            try:
                self._json = yaml.load(f)
                # empty docs result in None rather than {}, fix it.
                if self._json is None:
                    self._json = {}
            finally:
                f.close()
        elif json is not None:
            self._json = json

        if 'attrs' not in self._json:
            self._json['attrs'] = {}

        self._line_defaults = self._json.get('line_defaults', _empty_dict)
        self._fill_defaults = self._json.get('fill_defaults', _empty_dict)
        self._text_defaults = self._json.get('text_defaults', _empty_dict)

        # mapping from class name to the full set of properties
        # (including those merged in from base classes) for that
        # class.
        self._by_class_cache = {}

    def _add_glyph_defaults(self, cls, props):
        from ..models.glyphs import Glyph
        if issubclass(cls, Glyph):
            if hasattr(cls, "line_alpha"):
                props.update(self._line_defaults)
            if hasattr(cls, "fill_alpha"):
                props.update(self._fill_defaults)
            if hasattr(cls, "text_alpha"):
                props.update(self._text_defaults)

    def _for_class(self, cls):
        if cls.__name__ not in self._by_class_cache:
            attrs = self._json['attrs']
            combined = {}
            # we go in reverse order so that subclass props override base class
            for base in cls.__mro__[-2::-1]:
                if not issubclass(base, HasProps):
                    continue
                self._add_glyph_defaults(base, combined)
                combined.update(attrs.get(base.__name__, _empty_dict))
            if len(combined) == 0:
                combined = _empty_dict
            self._by_class_cache[cls.__name__] = combined
        return self._by_class_cache[cls.__name__]

    def apply_to_model(self, model):
        """Apply this theme to a model. Don't call this method directly,
        instead set the theme on the Document the model is a part of."""
        model.apply_theme(self._for_class(model.__class__))

        # a little paranoia because it would be Bad(tm) to mess
        # this up... would be nicer if python had a way to freeze
        # the dict.
        if len(_empty_dict) > 0:
            raise RuntimeError("Somebody put stuff in _empty_dict")


