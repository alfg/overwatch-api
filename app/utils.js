const utils = {
    filterIncludes(include, data) {
        // Filters response with include parameters.
        if (!include || include.length == 0 || typeof data == "string" || !data.hasOwnProperty(include[0]))
            return data;
        let first = include.shift();
        let output = {};
        output[first] = this.filterIncludes(include, data[first]);
        return output;
    }
}

export default utils;
