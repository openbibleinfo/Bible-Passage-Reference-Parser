bcv_utils =
	# Make a shallow clone of an object. Nested objects are referenced, not cloned.
	shallow_clone: (obj) ->
		return obj unless obj?
		out = {}
		for own key, val of obj
			out[key] = val
		out

	# Make a shallow clone of an array. Nested objects are referenced, not cloned.
	shallow_clone_array: (arr) ->
		return arr unless arr?
		out = []
		for i in [0 .. arr.length]
			out[i] = arr[i] if typeof(arr[i]) isnt "undefined"
		out
