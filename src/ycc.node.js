/**
 * Created by xiaohei on 2016/4/2.
 * 此文件应该放置在server端
 */

(function(Ycc){
    // 依赖于utils模块
    var utils = Ycc.utils;

    Ycc.Node = Node;
    // 节点列表
    Ycc.Node.nodeList = [];
    // 节点map
    Ycc.Node.nodeMap = {};

    // 获取节点的属性
    Ycc.Node.get_node_attr = get_node_attr;
    // 获取节点列表的属性
    Ycc.Node.get_node_list_attr = get_node_list_attr;





    // constructor
    function Node(style){
        // 祖先元素的node_id列表
        this.parents = [];
        // 子节点node_id列表
        this.children = [];
        // 节点在canvas中实际所占据的位置信息，该属性是私有信息，不应该被更改
        this._hold_rect = {left:0,top:0,width:0,height:0};
        // 节点被子元素占据的相关信息，私有信息，不应该被更改
        this._be_hold_info = {
            // 上一行的maxHeight
            lastMaxHeight:0,
            // 最下边元素所占据的相对当前node节点的位置
            // 应该包括margin
            maxHeight:0,
            // 从左至右元素所占据的相对当前node节点的位置
            // 应该包括margin
            left2right:0,
            // 从右至左元素所占据的位置，应该包括margin
            right2left:0
        };
        // 样式
        this.style = {};
        // 位置及盒模型
        this.style.display = "block";
        this.style.float = "none";
        this.style.position = "absolute";
        this.style.top = 0;
        this.style.bottom = 0;
        this.style.left = 0;
        this.style.right = 0;

        // 高宽
        this.style.width = 0;
        this.style.height = 0;
        // 边框
        this.style.borderColor = "#000";
        this.style.borderWidth = 0;
        this.style.borderTopWidth = 0;
        this.style.borderRightWidth = 0;
        this.style.borderBottomWidth = 0;
        this.style.borderLeftWidth = 0;
        // 内边距
        this.style.paddingTop = 0;
        this.style.paddingRight = 0;
        this.style.paddingBottom = 0;
        this.style.paddingLeft = 0;
        // 外边距
        this.style.margin = 0;
        this.style.marginTop = 0;
        this.style.marginRight = 0;
        this.style.marginBottom = 0;
        this.style.marginLeft = 0;
        // 背景色
        this.style.backgroundColor = "#fff";
        // 溢出处理
        this.style.overflow = null;
        this.style.overflowX = null;
        this.style.overflowY = "auto";

        if(utils.isObj(style))
            this.style = utils.extend(this.style,style);
    }

    var proto = Ycc.Node.prototype;

    // 标签名
    proto.tagName = "div";
    // 层级layer
    proto.layer = 1;
    // 每个节点的唯一标示
    proto.node_id = Math.random().toString(16).replace("0.",proto.layer+".");
    proto.add_child = add_child;
    proto.del_child = del_child;


    function add_child(node){
        node.layer = this.layer+1;
        node.node_id = Math.random().toString(16).replace("0.",node.layer+".");
        node.parents = this.parents.slice(0);
        node.parents.push(this.node_id);
        this.children.push(node.node_id);
        Ycc.Node.nodeList.push(node);
        Ycc.Node.nodeMap[node.node_id] = node;
    }

    function del_child(child_id){
        var index = this.children.indexOf(child_id);
        this.children.splice(index,1);

        Ycc.Node.nodeMap[child_id] = null;
        delete Ycc.Node.nodeMap[child_id];
        Ycc.Node.nodeList = [];
        for(var node in Ycc.Node.nodeMap){
            Ycc.Node.nodeList.push(node);
        }
    }


    // 获取所有属性值，转为json
    function get_node_attr(node){
        var json = {};
        var attr_num = 0;
        for(var attr in node){
            if(!Ycc.utils.isFn(attr)){
                attr_num++;
                json[attr] = node[attr];
            }
        }
        if(attr_num==0){
            json = null;
        }
        return json;
    }

    // 获取创建的所有节点属性
    function get_node_list_attr(){
        var arr = [];
        for(var i=0;i<Ycc.Node.nodeList.length;i++){
            arr.push(Ycc.Node.nodeList[i]);
        }
        return arr;
    }

})(Ycc);