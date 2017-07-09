const utils = {
    filterIncludes(include, data) {
        // Filters response with include parameters.
        if (!include || include.length == 0 || !data.hasOwnProperty(include[0]))
            return data;
        let first = include.shift();
        let output = {};
        if (typeof data[first] == "string"){
            output[first] = data[first];
        }
        else{
            output[first] = this.filterIncludes(include, data[first]);
        }
        return output;
    }
}

export default utils;
