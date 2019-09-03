var _default_vert = require("./ccShader_Default_Vert.js");
var _default_vert_no_mvp = require("./ccShader_Default_Vert_noMVP.js");
//var _effect_frag = require("./ccShader_MetaBall_Frag");

var _effect_frag = `
#ifdef GL_ES
precision mediump float;
#endif
varying vec2 v_texCoord;
uniform vec2 size;
{UNIFORM DIMS}
float distance2(vec2 a, vec2 b);
void main()
{
	float stepX = 1.0 / size.x;
	float stepY = 1.0 / size.y;
	float currX = v_texCoord.x / stepX;
	float currY = v_texCoord.y / stepY;
    gl_FragColor = texture2D(CC_Texture0, vec2(v_texCoord.x, 1.0 - v_texCoord.y)).rgba;
    float power = 0.0;
    float a2 = 0.0;

    {LOOP}
    
	if (power >= 10.0) {
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
}
float distance2(vec2 a, vec2 b) {
    return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
}
`

cc.Class({
    extends: cc.Component,

    properties: {
        mousePosLabel: {
            type: cc.Label,
            default: null
        }
    }, 

    onLoad: function () {
        this.parameters={
            startTime:Date.now(),
            time:0.0,
            mouse:{
                x:0.0,
                y:0.0,
            },
            resolution:{
                x:0.0,
                y:0.0,
            }

        };
        this.activated = false;
        this.num = 0;
        this.dim = [];
        this.node.on(cc.Node.EventType.MOUSE_MOVE, function (event) {
            this.parameters.mouse.x = event.getLocationX() / this.node.width;
            this.parameters.mouse.y = event.getLocationY() / this.node.height; 
        }, this);


        this.node.on( cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.parameters.mouse.x = event.getLocationX() / this.node.width;
            this.parameters.mouse.y = event.getLocationY() / this.node.height; 
        }, this);

    },
    activate: function(particleSystem) {
        this.particleSystem = particleSystem;
        var particles = particleSystem.GetPositionBuffer();
        var maxParticles = particles.length;
        this.num = maxParticles / 2;
        this.dim = [];
        for (var i = 0; i < this.num * 2; i += 2) {
            this.dim.push({x:0, y:0});
        }
        this._use();
        this.activated = true;
    },
    update:function(dt){
        if (!this.activated) {
            return;
        }
        if(this._program){

            this._program.use();
            this.updateGLParameters();
            
            var particles = this.particleSystem.GetPositionBuffer();
            for (var i = 0; i < this.num * 2; i += 2) {
                this.dim[i / 2].x = particles[i];
                this.dim[i / 2].y = particles[i + 1];
            }
            // cc.log(this.dim);
            if(cc.sys.isNative){
                var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this._program);
                glProgram_state.setUniformVec2( "size" , {x:this.node.width, y:this.node.height} );
                for (var i = 0; i < this.num; i += 1) {
                    var v = i;
                    glProgram_state.setUniformVec2( "dim_" + v, this.dim[i]);
                }
            }else{
                this._program.setUniformLocationWith2f( this._size , this.node.width, this.node.height );
                for (var i = 0; i < this.num; i += 1) {
                    this._program.setUniformLocationWith2f( this.balls[i] , this.dim[i].x, this.dim[i].y);
                }
            }
            if (this.mousePosLabel != null) {
                this.mousePosLabel.string = "" + this.parameters.mouse.x + "/" + this.parameters.mouse.y;
            }
        }
    },
    updateGLParameters(){
        this.parameters.time = (Date.now() - this.parameters.startTime)/1000;
        this.parameters.resolution.x = ( this.node.getContentSize().width );
        this.parameters.resolution.y = ( this.node.getContentSize().height );
    },

    _use: function()
    {
        var dimstr = "";
        for (let i = 0; i < this.num; i += 1) {
            dimstr = dimstr + "\r\n";
            dimstr = dimstr + "uniform vec2 dim_" + i + ";";
        }
        _effect_frag = _effect_frag.replace(/{UNIFORM DIMS}/g, dimstr);
        _effect_frag = _effect_frag.replace(/{NUM}/g, "" + this.num + "");
        var loopBase = 
        `
        a2 = distance2(vec2({DIM_I}.x / stepX, size.y - ({DIM_I}.y / stepY)), vec2(currX, currY));
        if (a2 < 25.0) {
            power += 10.0;
        } else {
            power += 2500.0 / a2;
        }
        `
        var loop = "";
        for (let i = 0; i < this.num; i += 1) {
            loop = loop + "\r\n";
            let loopSat = loopBase.replace(/{DIM_I}/g, "dim_" + i);
            loop = loop + loopSat;
        }
        _effect_frag = _effect_frag.replace(/{LOOP}/g, loop);
        cc.log("_effect_frag", _effect_frag);
        if (cc.sys.isNative) {
            cc.log("use native GLProgram");
            this._program = new cc.GLProgram();
            this._program.initWithString(_default_vert_no_mvp, _effect_frag);


            this._program.addAttribute(cc.macro.ATTRIBUTE_NAME_POSITION, cc.macro.VERTEX_ATTRIB_POSITION);
            this._program.addAttribute(cc.macro.ATTRIBUTE_NAME_COLOR, cc.macro.VERTEX_ATTRIB_COLOR);
            this._program.addAttribute(cc.macro.ATTRIBUTE_NAME_TEX_COORD, cc.macro.VERTEX_ATTRIB_TEX_COORDS);

            this._program.link();
            this._program.updateUniforms();
            this.updateGLParameters();


           
        }else{
            this._program = new cc.GLProgram();
            this._program.initWithVertexShaderByteArray(_default_vert, _effect_frag);
            this._program.addAttribute(cc.macro.ATTRIBUTE_NAME_POSITION, cc.macro.VERTEX_ATTRIB_POSITION);
            this._program.addAttribute(cc.macro.ATTRIBUTE_NAME_COLOR, cc.macro.VERTEX_ATTRIB_COLOR);
            this._program.addAttribute(cc.macro.ATTRIBUTE_NAME_TEX_COORD, cc.macro.VERTEX_ATTRIB_TEX_COORDS);

            this._program.link();
            this._program.updateUniforms();
            this._program.use();

            this.updateGLParameters();

        }
        
        if (cc.sys.isNative) {
            var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this._program);
            glProgram_state.setUniformVec2( "size" , {x:this.node.width, y:this.node.height} );
            for (var i = 0; i < this.num; i += 1) {
                glProgram_state.setUniformVec2( "dim_"+i, {x: this.dim[i].x, y: this.dim[i].y});
            }
        }else{
            this._size = this._program.getUniformLocationForName( "size" );
            this._program.setUniformLocationWith2f( this._size , this.node.width, this.node.height );
            this.balls = [];
            for (var i = 0; i < this.num; i += 1) {
                this.balls.push(this._program.getUniformLocationForName( "dim_" + i ));
                this._program.setUniformLocationWith2f( this.balls[i] , this.dim[i].x, this.dim[i].y);
            }
        }

        this.setProgram( this.node._sgNode ,this._program );
    },
    
    setProgram:function (node, program) {
        if (cc.sys.isNative) {
            var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(program);
            node.setGLProgramState(glProgram_state);
        }else{
            node.setShaderProgram(program);    
        }
        
    
        var children = node.children;
        if (!children)
            return;
    
        for (var i = 0; i < children.length; i++)
            this.setProgram(children[i], program);
    }

});
