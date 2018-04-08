(function($){    
      
    $.extend($.fn.tree.methods, {  
        /**  
         * 仅限树数据一次性把数据加载完成的树
         * 扩展easyui tree的搜索方法  
         * @param tree easyui tree的根DOM节点(UL节点)的jQuery对象  
         * @param searchText 检索的文本  
         * @param this-context easyui tree的tree对象  
         */  
        search: function(jqTree, searchText) {  
            //easyui tree的tree对象。可以通过tree.methodName(jqTree)方式调用easyui tree的方法  
            var tree = this;  
            //获取树的所有叶子节点  
            var nodeList = getAllLefNodes(jqTree, tree);  
            var matchedNodeList = [];  
            if (nodeList && nodeList.length>0) {  
                var node = null;  
                for (var i=0; i<nodeList.length; i++) {  
                    node = nodeList[i];  
                    //排除目录
                    if (isMatch(searchText, node.text)&&node.attributes.resType!='DIR') {
                        matchedNodeList.push(node);  
                    }  
                }  
            }   
            //返回匹配上的节点
            return  matchedNodeList;
        },  
    });  
    /**  
     * 判断searchText是否与targetText匹配  
     * @param searchText 检索的文本  
     * @param targetText 目标文本  
     * @return true-检索的文本与目标文本匹配；否则为false.  
     */  
    function isMatch(searchText, targetText) {  
        return $.trim(targetText)!="" && targetText.indexOf(searchText)!=-1;  
    }  
      
    /**  
     * 获取所有叶子节点 
     */  
    function getAllLefNodes(jqTree, tree) {  
        var nodes = tree.getRoots(jqTree);  
        var childNodeList = [];  
        if (nodes && nodes.length>0) {             
            var node = null;  
            for (var i=0; i<nodes.length; i++) { 
                	node = nodes[i];  
                    var children = tree.getChildren(jqTree, node.target);  
                    for(var j=0; j<children.length; j++){
                    	if(children[j].attributes.isLef=='1'){
                    		childNodeList.push(children[j]);
                    	}
                    }
            }  
        }  
        return childNodeList;    
    }  
})(jQuery);  