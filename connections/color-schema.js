export default class ColorSchema {
    static SCHEMAS = {
        'default': {
            'red': '#f05454',
            'black': '#222831',
            'line': '#30475e',
            'bg': '#e8e8e8'
        },
        'dark': {
            'bg': '#fee9d7',
            'red': '#e2434b',
            'line': '#f9bf8f',
            'black': '#34222e'
        }
    }

    static currentSchema = 'default';

    static getLineColor() {
        let colors = this.SCHEMAS[this.currentSchema];
        if (colors != null) {
            return colors.line;
        }
        return '#000000'
    }

    static getRedColor() {
        let colors = this.SCHEMAS[this.currentSchema];
        if (colors != null) {
            let r = colors.red;
            return this.hexToRgb(r);
        }
        return { 'red': 0, 'green': 0, 'blue': 0 };
    }

    static getBlackColor() {
        let colors = this.SCHEMAS[this.currentSchema];
        if (colors != null) {
            let r = colors.black;
            return this.hexToRgb(r);
        }
        return { 'red': 0, 'green': 0, 'blue': 0 };
    }

    static getBackGroundColor() {
        let colors = this.SCHEMAS[this.currentSchema];
        if (colors != null) {
            return colors.bg;
        }
        return '#ffffff';
    }

    static cache = {};

    static hexToRgb(hex) {
        let color = this.cache[hex];
        if (color == null) {
            let s = hex.substring(1, 3);
            let r = Number.parseInt(s, 16);
            s = hex.substring(3, 5);
            let g = Number.parseInt(s, 16);
            s = hex.substring(5, 7);
            let b = Number.parseInt(s, 16);
            color = { 'red': r, 'green': g, 'blue': b };
            this.cache[hex] = color;
        }
        return color;
    }
}