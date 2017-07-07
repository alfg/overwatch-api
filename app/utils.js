const utils = {
    filterIncludes(include, data) {
        if (!include || include.length == 0 || !data.hasOwnProperty(include[0])) {
            return data;
        }
        let first = include.shift();
        return filterIncludes(include, data[first]);
    }
}

export default utils;
