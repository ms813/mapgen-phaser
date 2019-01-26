class Vector {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static get cardinal() {
        return Vector._cardinal;
    }

    static get ordinal() {
        return Vector._ordinal;
    }

    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    static mul(v, scalar) {
        return new Vector(v.x * scalar, v.y * scalar);
    }

    static memberwiseMul(v1, v2) {
        return new Vector(v1.x * v2.x, v1.y * v2.y);
    }

    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    static unitNormal(v) {
        return Vector.normalise(new Vector(-v.y, v.x));
    }

    static normalise(v) {
        const mag = Vector.magnitude(v);
        return new Vector(v.x / mag, v.y / mag);
    }

    static magnitude(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    static getAngle(v) {
        return Math.atan2(v.y, v.x);
    }

    static toPrimaryDirection(v) {
        const angle = this.getAngle(v);

        if ((angle > -(1 / 8) * Math.PI) && (angle <= (1 / 8) * Math.PI)) {
            return Vector.EAST;
        } else if ((angle > (1 / 8) * Math.PI) && (angle <= (3 / 8) * Math.PI)) {
            return Vector.NORTH_EAST;
        } else if ((angle > (3 / 8) * Math.PI) && (angle <= (5 / 8) * Math.PI)) {
            return Vector.NORTH;
        } else if ((angle > (5 / 8) * Math.PI) && (angle <= (7 / 8) * Math.PI)) {
            return Vector.NORTH_WEST;
        } else if ((angle > -(1 / 8) * Math.PI) && (angle <= -(3 / 8) * Math.PI)) {
            return Vector.SOUTH_EAST;
        } else if ((angle > -(3 / 8) * Math.PI) && (angle <= -(5 / 8) * Math.PI)) {
            return Vector.SOUTH;
        } else if ((angle > -(5 / 8) * Math.PI) && (angle <= -(7 / 8) * Math.PI)) {
            return Vector.SOUTH_WEST;
        } else {
            return Vector.WEST;
        }
    }

    static dot(v1, v2) {
        return (v1.x * v2.x) + (v1.y + v2.y);
    }
}


export default Vector;
