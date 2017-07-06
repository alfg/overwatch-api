const utils = {
    filterIncludes(include, data) {
        if (!include) {
            return data;
        }
        // Filters response with include parameters.
        const filtered = Object.keys(data)
        .filter(key => include.includes(key))
        .reduce((obj, key) => {
            obj[key] = data[key];
            return obj;
        }, {});
        return filtered;
    }
}

export default utils;