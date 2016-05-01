In versions prior to the November 2015 release (1.0.0), this folder contained "eu"-style punctuation, where periods (".") are used in sequences and commas (",") are used to separate chapters and verses:

```javascript
bcv.parse("Matt 1, 2. 4").osis();
// Matt.1.2,Matt.1.4
```

These files duplicated nearly all the code found in `/js/`.

As of 1.0.0, this functionality is available to you in the `punctuation_strategy` runtime option:

```javascript
bcv.parse("Matt 1, 2. 4").osis();
// Matt.1,Matt.2.4
bcv.set_options({punctuation_strategy: "eu"});
bcv.parse("Matt 1, 2. 4").osis();
// Matt.1.2,Matt.1.4
```

This readme file exists to ease the transition for those of you looking for these files. This readme will go away in time to reduce code clutter.
