const utils = {
    filterIncludes(include, data) {
        // Filters response with include parameters.
        if (!include || include.length == 0 || typeof data == "string" || !data.hasOwnProperty(include[0]))
            return data;
        let first = include.shift();
        let filtered = {};
        filtered[first] = this.filterIncludes(include, data[first]);
        return filtered;
    }
}

export default utils;
