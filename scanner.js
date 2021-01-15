class ScannerJS {
    captured(sourceImage, params) {
        /** defile params **/

        if (params != null) {
            this.width = params.width !== undefined ? params.width : null;
            this.height = params.height !== undefined ? params.height : null;
        }

        this.source = new Image();
        this.source.addEventListener("load", function () {

            let scaleFactor = this.source.width / this.source.height;

            this.setSourceSize(this.source.width, this.source.height);

            let width = this.source.width;
            let height = this.source.height;

            if (this.width != null && this.height != null) {
                if (this.source.width >= this.width && this.source.height >= this.height) {
                    if (this.source.width === this.source.height) {
                        width = Math.min(this.width, this.height);
                        height = Math.min(this.width, this.height);
                    } else if (this.source.width > this.source.height) {
                        width = this.width;
                        height = Math.round(width / scaleFactor);

                        if (height > this.height) {
                            height = this.height;
                            width = Math.round(height * scaleFactor);
                        }
                    } else if (this.source.height > this.source.width) {
                        height = this.height;
                        width = Math.round(height * scaleFactor);

                        if (width > this.width) {
                            width = this.width;
                            height = Math.round(width / scaleFactor);
                        }
                    }
                } else if (this.source.width >= this.width && this.source.height < this.height) {
                    width = this.width;
                    height = Math.round(width / scaleFactor);
                } else if (this.source.height >= this.height && this.source.width < this.width) {
                    height = this.height;
                    width = Math.round(height * scaleFactor);
                }
            } else {
                this.width = width;
                this.height = height;
            }


            this.setOffset((this.width - width) / 2, (this.height - height) / 2);
            this.setRealSize(width, height);

            this.sourceCanvas = document.createElement("canvas");
            this.sourceContext = this.sourceCanvas.getContext('2d');

            this.linesCanvas = document.createElement("canvas");
            this.linesContext = this.linesCanvas.getContext('2d');

            this.sourceContext.canvas.width = this.width;
            this.sourceContext.canvas.height = this.height;

            this.linesContext.canvas.width = this.width;
            this.linesContext.canvas.height = this.height;

            this.sourceContext.drawImage(this.source, this.offsetWidth, this.offsetHeight, width, height);

            console.log('captured', this);
            this.process();

        }.bind(this));
        this.source.src = sourceImage;
    }

    process() {
        let img = new Image();
        img.addEventListener("load", () => {
            this.sourceImg = img;

            this.colors(img);
            let points = this.groups();

            let accessPoints = [];
            let borders1 = this.findMethod1(points);
            let distances1 = this.progressDistance(borders1);

            if (distances1 === 4) {
                // this.controller(borders1);
                console.log(`borders`, borders1);
                return borders1;
            }

            let borders2 = this.findMethod2(points);
            let distances2 = this.progressDistance(borders2);

            if (distances2 === 4 || distances2 > distances1) {
                // this.controller(borders2);
                console.log(`borders`, borders2);
                return borders2;
            }

            // this.controller(borders2);
        });
        img.src = this.sourceContext.canvas.toDataURL();
    }

    controller(p) {
        this.widthPresent = this.linesContext.canvas.offsetWidth / this.linesContext.canvas.width;
        this.heightPresent = this.linesContext.canvas.offsetHeight / this.linesContext.canvas.height;

        this.points[0].style.top = `${((p[0][1] + this.offsetHeight) * this.heightPresent) - this.pointMargin}px`;
        this.points[0].style.left = `${((p[0][0] + this.offsetWidth) * this.widthPresent) - this.pointMargin}px`;
        this.points[0].style.display = "block";

        this.points[1].style.top = `${((p[1][1] + this.offsetHeight) * this.heightPresent) - this.pointMargin}px`;
        this.points[1].style.left = `${((p[1][0] + this.offsetWidth) * this.widthPresent) - this.pointMargin}px`;
        this.points[1].style.display = "block";

        this.points[2].style.top = `${((p[2][1] + this.offsetHeight) * this.heightPresent) - this.pointMargin}px`;
        this.points[2].style.left = `${((p[2][0] + this.offsetWidth) * this.widthPresent) - this.pointMargin}px`;
        this.points[2].style.display = "block";

        this.points[3].style.top = `${((p[3][1] + this.offsetHeight) * this.heightPresent) - this.pointMargin}px`;
        this.points[3].style.left = `${((p[3][0] + this.offsetWidth) * this.widthPresent) - this.pointMargin}px`;
        this.points[3].style.display = "block";

        this.reDrawRect();
    }

    distance(point1, point2) {
        return Math.sqrt((Math.pow(point1[0] - point2[0], 2)) + (Math.pow(point1[1] - point2[1], 2)));
    }

    avg(v1, v2, v3) {
        return Math.round((v1 + v2 + v3) / 3);
    }

    progressDistance(points) {
        let d1 = Math.round(this.distance(points[0], points[1]));
        let d2 = Math.round(this.distance(points[1], points[2]));
        let d3 = Math.round(this.distance(points[2], points[3]));
        let d4 = Math.round(this.distance(points[3], points[0]));

        let flexibility = ((this.accuracyX + this.accuracyY) / 2) * 1.5;

        let avg1 = this.avg(d2, d3, d4);
        let avg2 = this.avg(d1, d3, d4);
        let avg3 = this.avg(d2, d1, d4);
        let avg4 = this.avg(d2, d3, d1);

        let check = 0;

        if (avg1 - flexibility <= d1 && avg1 + flexibility >= d1) check += 1;
        if (avg2 - flexibility <= d2 && avg2 + flexibility >= d2) check += 1;
        if (avg3 - flexibility <= d3 && avg3 + flexibility >= d3) check += 1;
        if (avg4 - flexibility <= d1 && avg4 + flexibility >= d4) check += 1;

        return check;
    }

    setSourceSize(width, height) {
        this.source_width = width;
        this.source_height = height;
    }

    setOffset(width, height) {
        this.offsetWidth = width;
        this.offsetHeight = height;
    }

    setRealSize(width, height) {
        this.real_width = width;
        this.real_height = height;
        this.accuracyX = width / 10;
        this.accuracyY = height / 10;
    }

    colors(img) {
        const colorThief = new ColorThief();

        let light = [0, 0, 0],
            dark = [255, 255, 255],
            color = colorThief.getPalette(img, 8);

        for (let i = 0; i < color.length; i++) {
            if ((dark[0] + dark[1] + dark[2]) > (color[i][0] + color[i][1] + color[i][2])) {
                dark = color[i];
            }

            if ((light[0] + light[1] + light[2]) < (color[i][0] + color[i][1] + color[i][2])) {
                light = color[i];
            }
        }

        this.setColors(light, dark);
    }

    setColors(light, dark) {
        this.color_light = light;
        this.color_dark = dark;
    }

    pointPaper(x, y) {
        let p = this.sourceContext.getImageData(x + this.offsetWidth, y + this.offsetHeight, 1, 1).data;
        if ((p[0] === 0) && (p[1] === 0) && (p[2] === 0) && (p[3] === 0))
            return false;
        return ((p[0] >= (this.color_light[0] - 50)) && (p[1] >= (this.color_light[1] - 50)) && (p[3] >= (this.color_light[2] - 50)));
    }

    groups() {
        let scan = [];
        let groups = [];
        let points = [];

        for (let x = 0; x <= this.accuracyX; x++) {
            for (let y = 0; y <= this.accuracyY; y++) {
                let paperX = Math.round(this.real_width / (this.accuracyX / x));
                let paperY = Math.round(this.real_height / (this.accuracyY / y));
                if (this.pointPaper(paperX, paperY)) {
                    points.push([paperX, paperY, x, y]);
                }
            }
        }

        scan = this.random(points, this.scanPoint);

        for (let i = 0; i < scan.length; i++) {
            if (this.isInGroups(scan[i], groups))
                continue;

            groups.push(this.getGroups(scan[i], [], points));
        }

        let paper = [];
        let max = 0;

        for (let i = 0; i < groups.length; i++) {
            if (groups[i].length > max) {
                max = groups[i].length;
                paper = groups[i];
            }
        }

        return paper;
    }

    isInGroups(point, groups) {
        for (let i = 0; i < groups.length; i++) {
            if (this.isInGroup(point, groups[i])) {
                return true;
            }
        }
        return false;
    }

    isInGroup(point, group) {
        for (let i = 0; i < group.length; i++) {
            if (group[i][0] === point[0] && group[i][1] === point[1]) {
                return true;
            }
        }
        return false;
    }

    random(a, length) {
        return this.shuffle(a).slice(a.length - length);
    }

    shuffle(a) {
        let j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    getGroups(point, group, points) {
        group.push(point);

        if (this.aroundMe(point[2] - 1, point[3], group) === false) {
            let top = this.aroundMe(point[2] - 1, point[3], points);
            if (top !== false) {
                group.concat(this.getGroups(top, group, points));
            }
        }

        if (this.aroundMe(point[2], point[3] - 1, group) === false) {
            let left = this.aroundMe(point[2], point[3] - 1, points);
            if (left !== false) {
                group.concat(this.getGroups(left, group, points));
            }
        }

        if (this.aroundMe(point[2] + 1, point[3], group) === false) {
            let bottom = this.aroundMe(point[2] + 1, point[3], points);
            if (bottom !== false) {
                group.concat(this.getGroups(bottom, group, points));
            }
        }

        if (this.aroundMe(point[2], point[3] + 1, group) === false) {
            let right = this.aroundMe(point[2], point[3] + 1, points);
            if (right !== false) {
                group.concat(this.getGroups(right, group, points));
            }
        }
        return group;
    }

    aroundMe(x, y, points) {
        for (let i = 0; i < points.length; i++) {
            if (x === points[i][2] && y === points[i][3]) {
                return points[i];
            }
        }
        return false;
    }

    findMethod1(borders) {
        let pointsY = [];
        let pointsX = [];

        for (let i = 0; i < borders.length; i++) {
            pointsY.push(borders[i][1]);
            pointsX.push(borders[i][0]);
        }

        let pointTop = Math.min.apply(null, pointsY);
        let pointRight = Math.max.apply(null, pointsX);
        let pointBottom = Math.max.apply(null, pointsY);
        let pointLeft = Math.min.apply(null, pointsX);

        let pointTopLeft = null;
        let pointRightTop = null;
        let pointBottomRight = null;
        let pointLeftBottom = null;

        for (let i = 0; i < borders.length; i++) {
            if (borders[i][0] === pointLeft) {
                if (pointLeftBottom == null || pointLeftBottom < borders[i][1]) {
                    pointLeftBottom = borders[i][1];
                }
            }

            if (borders[i][1] === pointBottom) {
                if (pointBottomRight == null || pointBottomRight < borders[i][0]) {
                    pointBottomRight = borders[i][0];
                }
            }

            if (borders[i][1] === pointTop) {
                if (pointTopLeft == null || pointTopLeft > borders[i][0]) {
                    pointTopLeft = borders[i][0];
                }
            }

            if (borders[i][0] === pointRight) {
                if (pointRightTop == null || pointRightTop > borders[i][1]) {
                    pointRightTop = borders[i][1];
                }
            }
        }

        return [
            [pointTopLeft, pointTop],
            [pointRight, pointRightTop],
            [pointBottomRight, pointBottom],
            [pointLeft, pointLeftBottom]
        ];
    }

    findMethod2(borders) {
        let minSumXY = null;
        let maxSumXY = null;
        let minSubXY = null;
        let maxSubXY = null;

        let p1;
        let p2;
        let p3;
        let p4;

        for (let i = 0; i < borders.length; i++) {
            let sum = borders[i][0] + borders[i][1];
            let sub = borders[i][0] - borders[i][1];
            if (minSumXY == null || minSumXY > sum) {
                minSumXY = sum;
                p1 = borders[i];
            }

            if (maxSubXY == null || maxSubXY < sub) {
                maxSubXY = sub;
                p2 = borders[i];
            }

            if (maxSumXY == null || maxSumXY < sum) {
                maxSumXY = sum;
                p3 = borders[i];
            }

            if (minSubXY == null || minSubXY > sub) {
                minSubXY = sub;
                p4 = borders[i];
            }
        }

        return [p1, p2, p3, p4];
    }
}