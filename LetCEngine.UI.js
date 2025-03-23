LetCEngine.UI = LetCEngine.UI || {}; 

// Define the Button class within the namespace 
LetCEngine.UI.Button = class { 

    constructor(x, y, width, height, layer) {

        this.x = x; this.y = y; this.width = width; this.height = height; this.layer = layer;

        this.buttonGroup = new Konva.Group({
            x: 0,
            y: 0
        }); 
    }

    LoadImage(imagePath){
        return new Promise((OnSuccess, OnFailure) => {
            const img = new Image();
            img.src = imagePath;
            img.onload = () => OnSuccess(img);
            img.onerror = () => OnFailure(new Error('Failed to load image'));
        });
    }

    SetImage(image){
        this.bgImage = image;

        this.konvaImage = new Konva.Image({
            x: this.x,
            y: this.y,
            image: this.bgImage,
            width: this.width,
            height: this.height,
            offsetX: this.width / 2,
            offsetY: this.height / 2
        });
    }

    SetText(text, offset){
        this.konvaText = new Konva.Text({
            x: this.x + offset.x,
            y: this.y + offset.y,
            width: this.width,
            align: 'center',
            text: text,
            fontSize: 24,
            fill: 'white',
            offsetX: this.width / 2,
            offsetY: this.height / 2
        });
    }

    ScaleUpTween() {
        // Define tween for scaling up
        var tweenScaleUp = new Konva.Tween({
            node: this.konvaImage,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 0.2,
            easing: Konva.Easings.EaseInOut
        });
        tweenScaleUp.play();
        //return tweenScaleUp;
    }

    ScaleDownTween() {
        // Define tween for scaling down
        var tweenScaleDown = new Konva.Tween({
            node: this.konvaImage,
            scaleX: 1,
            scaleY: 1,
            duration: 0.2,
            easing: Konva.Easings.EaseInOut
        });
        tweenScaleDown.play();
        //return tweenScaleDown;
    }    

    Init(){
        this.buttonGroup.add(this.konvaImage);
        this.buttonGroup.add(this.konvaText);

        // Add click event listener to the button
        /* this.buttonGroup.on('click', function() {
            alert('Button clicked!');
        }); */

        // Change cursor to pointer on hover
        this.buttonGroup.on('mouseover', function() {
            document.body.style.cursor = 'pointer';
            this.ScaleUpTween();//.play();
        }.bind(this));

        this.buttonGroup.on('mouseout', function() {
            document.body.style.cursor = 'default';
            this.ScaleDownTween();//.play();
        }.bind(this));


        this.layer.add(this.buttonGroup);
        this.layer.draw();
    }
};



LetCEngine.UI.CheckBox = class { 

    constructor(x, y, width, height, layer) {

        this.x = x; this.y = y; this.width = width; this.height = height; this.layer = layer;

        this.group = new Konva.Group({
            x: 0,
            y: 0
        }); 

        // Create a rectangle for the checkbox
        this.checkBox = new Konva.Rect({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1,
            offsetX: this.width / 2,
            offsetY: this.height / 2
        });

        // Create a line for the check mark (initially hidden)
        //points: [(this.x+4) - this.width / 2, (this.y+10) - this.height / 2, (this.x+7) - this.width / 2, (this.y+6) - this.height / 2, (this.x+16) - this.width / 2, (this.y+4) - this.height / 2],
        this.checkMark = new Konva.Line({
            points: [(this.x+4) - this.width / 2, (this.y+10) - this.height / 2, (this.x+7) - this.width / 2, (this.y+16) - this.height / 2, (this.x+16) - this.width / 2, (this.y+4) - this.height / 2],
            stroke: 'black',
            strokeWidth: 1,
            lineCap: 'round',
            lineJoin: 'round',
            visible: false
        });

        this.group.add(this.checkBox);
        this.group.add(this.checkMark);
        this.layer.add(this.group);
        this.layer.draw();


        // Handle checkbox click event
        this.checkBox.on('click', function() {
            this.checkMark.visible(!this.checkMark.visible());
            layer.draw();
        }.bind(this));

        // Optional: Change cursor to pointer on hover
        this.checkBox.on('mouseover', function() {
            document.body.style.cursor = 'pointer';
        });

        this.checkBox.on('mouseout', function() {
            document.body.style.cursor = 'default';
        });
    }

    SetText(text, width, offset){
        this.konvaText = new Konva.Text({
            x: this.x + offset.x,
            y: this.y + offset.y,
            width: width,
            align: 'left',
            text: text,
            fontSize: 24,
            fill: '#383735',
            offsetX: width / 2,
            offsetY: width / 2
        });

        this.group.add(this.konvaText);
        //this.layer.draw();
    }
};


LetCEngine.UI.Text = class { 

    constructor(x, y, width, height, text, fontSize, fontColor, layer) {

        this.x = x; this.y = y; this.width = width; this.height = height; this.layer = layer;

        this.konvaText = new Konva.Text({
            x: this.x,
            y: this.y,
            width: this.width,
            align: 'center',
            text: text,
            fontSize: fontSize,
            fill: fontColor,
            offsetX: this.width / 2,
            offsetY: this.height / 2
        });
        
        this.layer.add(this.konvaText);
        this.layer.draw();
    }
};