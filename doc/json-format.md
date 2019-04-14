# JSON Format

Even though Shields is probably best known for its SVG badges, you can also retrieve
a JSON payload by replacing the `.svg` extension with `.json`.

For instance, hitting [this endpoint](https://img.shields.io/badge/hello-world-brightgreen.json)
will generate the following payload:

```
{
  "name": "hello",
  "label": "hello",
  "value": "world",
  "message": "world",
  "color": "brightgreen"
}
```

Note that the values of the `name` and `value` fields are duplicates of the `label`
and `message` ones, respectively. As of April 2019, `name` and `value` are deprecated
and will be removed in a future release, please consider migrating your application
to use `label` and `message` instead.

Feel free to [open an issue](https://github.com/badges/shields/issues/new/choose)
if you have any queries regarding the JSON format.
