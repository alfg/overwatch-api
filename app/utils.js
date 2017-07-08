const utils = {
    filterIncludes(include, data) {
        // Filters response with include parameters.
        if (!include || include.length == 0 || !data.hasOwnProperty(include[0]))
            return data;
        let first = include.shift();
        if (typeof data[first] == "string"){
            let output = {};
            output[first] = data[first];
            return output;
        }
        return filterIncludes(include, data[first]);
    }
}

export default utils;
