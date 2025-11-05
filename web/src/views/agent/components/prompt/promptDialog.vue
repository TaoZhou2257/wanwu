<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="80%"
    :before-close="handleClose"
    class="prompt-dialog"
  >
    <div slot="title" class="dialog-title">
      <span class="title-text">{{$t('tempSquare.prompt')}}</span>
      <el-input
        v-model="searchKeyword"
        :placeholder="$t('agent.promptTemplate.searchPlaceholder')"
        prefix-icon="el-icon-search"
        class="title-search-input"
        clearable
        @clear="handleSearchClear"
        @keyup.enter.native="handleSearch"
      ></el-input>
    </div>
    <div class="prompt-library-content">
      <div class="tab-buttons">
        <div 
          class="tab-button" 
          :class="{ active: activeTab === 'builtIn' }"
          @click="activeTab = 'builtIn'"
        >
          {{ $t('agent.promptTemplate.builtIn') }}
        </div>
        <div 
          class="tab-button" 
          :class="{ active: activeTab === 'custom' }"
          @click="activeTab = 'custom'"
        >
          {{ $t('agent.promptTemplate.custom') }}
        </div>
      </div>
      <div class="library-main">
        <div class="template-list">
          <div
            v-for="item in templateList"
            :key="item.id"
            class="template-item"
            :class="{ active: selectedTemplate && selectedTemplate.id === item.id }"
            @click="selectTemplate(item)"
          >
            <div class="template-content">
              <div class="template-logo">
                <i class="el-icon-document"></i>
              </div>
              <div class="template-info">
                <div class="template-name">{{ item.name }}</div>
                <div class="template-desc">{{ item.desc }}</div>
              </div>
            </div>
            <div class="template-actions" @click.stop="handleInsertPrompt(item)">
              <el-button type="text" size="mini">{{ $t('agent.promptTemplate.insertPrompt') }}</el-button>
            </div>
          </div>
        </div>

        <div class="template-detail" v-if="selectedTemplate">
          <div class="detail-content markdown-body" v-html="formatTemplateContent(selectedTemplate.content)"></div>
        </div>
        <div class="template-detail empty" v-else>
          <div class="empty-text">{{ $t('agent.promptTemplate.selectTemplate')}}</div>
        </div>
      </div>
    </div>

  </el-dialog>
</template>

<script>
import { md } from "@/mixins/marksown-it.js";

export default {
  name: 'PromptDialog',
  data() {
    return {
      dialogVisible: false,
      searchKeyword: '',
      activeTab: 'builtIn',
      selectedTemplate: null,
      templateList: [
        {
          id: 1,
          name: '通用结构',
          desc: '适用于多种场景的提示词结构，可以根据具体需求调整不同的部分',
          content: `# 角色：角色名称\n角色概述和主要职责的一句话描述\n\n## 目标：\n角色的工作目标，如果有多个目标可以分点列出，但建议更聚焦1-2个目标\n\n## 技能：\n1. 为了实现目标，角色需要具备的技能1\n2. 为了实现目标，角色需要具备的技能2\n3. 为了实现目标，角色需要具备的技能3\n\n## 工作流：\n1. 描述角色工作流程的第一步\n2. 描述角色工作流程的第二步\n3. 描述角色工作流程的第三步`
        },
        {
          id: 2,
          name: '任务执行',
          desc: '适用于有明确的工作步骤的任务执行场景，强调步骤的清晰度和可操作性',
          content: `# 角色：任务执行助手\n你是一个专业的任务执行助手，擅长分解和执行复杂任务\n\n## 任务目标：\n[清晰描述需要完成的任务]\n\n## 执行步骤：\n1. 步骤一：[具体操作]\n2. 步骤二：[具体操作]\n3. 步骤三：[具体操作]\n\n## 注意事项：\n- 注意事项1\n- 注意事项2`
        },
        {
          id: 3,
          name: '角色扮演',
          desc: '适用于聊天陪伴、互动娱乐场景，可帮助模型扮演特定的角色进行对话',
          content: `# 角色：[角色名称]\n\n## 角色背景：\n[详细描述角色的背景故事、性格特点、说话风格等]\n\n## 对话风格：\n- 语言特点：[如幽默、专业、温和等]\n- 常用表达：[角色特有的口头禅或表达方式]\n\n## 互动方式：\n[描述如何与用户互动，如何回应不同类型的问题]`
        },
        {
          id: 4,
          name: '技能调用（搜索插件）',
          desc: '适用于调用插件、工作流获取信息并按照格式输出的场景',
          content: `# 角色：信息检索专家\n你擅长使用各种工具检索和整合信息\n\n## 工作流程：\n1. 理解用户需求\n2. 选择合适的搜索工具\n3. 执行搜索并获取结果\n4. 整理和呈现信息\n\n## 输出格式：\n根据搜索结果，按照以下格式输出：\n- 来源：[信息来源]\n- 摘要：[核心内容]\n- 详情：[详细信息]`
        },
        {
          id: 5,
          name: '基于知识库回答',
          desc: '适用于客服等基于特定知识库回答的场景',
          content: `# 角色：专业客服\n你是一个专业的客服人员，基于公司知识库为用户提供准确的答案\n\n## 工作原则：\n1. 优先从知识库中查找答案\n2. 确保回答准确、专业\n3. 如果知识库中没有相关信息，诚实告知用户\n\n## 回答流程：\n1. 理解用户问题\n2. 在知识库中检索相关信息\n3. 组织语言，清晰回答\n4. 必要时提供补充说明`
        },
        {
          id: 6,
          name: '使用Jinja语法',
          desc: '以生成图提示词的设计师为例，可以试试使用Jinja语法，让提示词更灵活',
          content: `# 角色：AI绘画提示词专家\n你是一个专业的AI绘画提示词设计师\n\n## 任务：\n根据用户输入生成专业的绘画提示词\n\n{% if style %}\n## 风格要求：\n{{ style }}\n{% endif %}\n\n{% if elements %}\n## 必包含元素：\n{% for element in elements %}\n- {{ element }}\n{% endfor %}\n{% endif %}\n\n## 输出格式：\n请生成详细的英文提示词，包含：主体、风格、光照、构图等要素`
        }
      ]
    }
  },
  methods: {
    showDiglog(data) {
      this.dialogVisible = true;
      if (data && data.id) {
        const template = this.templateList.find(t => t.id === data.id);
        if (template) {
          this.selectedTemplate = template;
        }
      }
    },
    handleClose() {
      this.dialogVisible = false;
      this.selectedTemplate = null;
      this.searchKeyword = '';
    },
    handleSearch() {
      this.$emit('search', this.searchKeyword);
    },
    handleSearchClear() {
      this.searchKeyword = '';
      this.$emit('search', '');
    },
    selectTemplate(template) {
      this.selectedTemplate = template;
    },
    handleInsertPrompt(item) {
      this.$emit('insert', item.content);
      this.$message.success(this.$t('agent.promptTemplate.insertSuccess') || '插入成功');
    },
    formatTemplateContent(content) {
      if (!content) return '';
      return md.render(content);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/markdown.scss";

.prompt-dialog {
  /deep/ .el-dialog__body {
    padding: 5px 20px 20px 20px;
  }
  
  /deep/ .el-dialog__header {
    padding: 20px 20px 10px;
    display: flex;
    align-items: center;
  }
  
  /deep/ .el-dialog__headerbtn {
    position:unset!important;
  }
}

.dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  
  .title-text {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
  }
  
  .title-search-input {
    width: 300px;
    margin-right:10px;
    /deep/ .el-input__inner {
      height: 32px;
      line-height: 32px;
    }
  }
}

.prompt-library-content {
  .tab-buttons {
    display: flex;
    margin-bottom: 16px;
    
    .tab-button {
      padding:5px 10px;
      cursor: pointer;
      font-size: 14px;
      color: #606266;
      transition: all 0.3s;
      
      &:hover {
        color: $color;
      }
      
      &.active {
        color: $color;
        font-weight: 500;
      }
    }
  }
  
  .library-main {
    display: flex;
    gap: 16px;
    height: 400px;
    margin-top: 16px;
    
    .template-list {
      width:30vw;
      flex-shrink: 0;
      border: 1px solid #EBEEF5;
      border-radius: 4px;
      overflow-y: auto;
      
      .template-item {
        padding: 12px 10px;
        border-bottom: 1px solid #EBEEF5;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background-color: #F5F7FA;
          
          .template-actions {
            opacity: 1;
          }
        }
        
        &.active {
          background-color: #ECF5FF;
          border-left: 3px solid $color;
          
          .template-name {
            color: $color;
          }
        }
        
        .template-content {
          flex: 1;
          display: flex;
          align-items: center;
          min-width: 0;
          
          .template-logo {
            width: 40px;
            height: 40px;
            border-radius:50%;
            background:#eee;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            
            i {
              font-size: 20px;
              color: $color;
            }
          }
          
          .template-info {
            flex: 1;
            min-width: 0;
            
            .template-name {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .template-desc {
              font-size: 12px;
              color: #909399;
              line-height: 1.5;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          }
        }
        
        .template-actions {
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.3s;
          
          /deep/ .el-button {
            padding: 4px 0;
          }
        }
      }
    }
    
    .template-detail {
      flex: 1;
      border: 1px solid #EBEEF5;
      border-radius: 4px;
      padding: 20px;
      overflow-y: auto;
      background-color: #FAFAFA;
      
      &.empty {
        display: flex;
        align-items: center;
        justify-content: center;
        
        .empty-text {
          font-size: 14px;
          color: #909399;
        }
      }
      
      .detail-content {
        font-size: 14px;
        line-height: 1.8;
        color: #303133;
        
        /deep/ h1, /deep/ h2, /deep/ h3 {
          margin-top: 16px;
          margin-bottom: 8px;
          
          &:first-child {
            margin-top: 0;
          }
        }
      }
    }
  }
}
</style>