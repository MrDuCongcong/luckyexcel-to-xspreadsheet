<!--
 * @Author: DuCongcong
 * @Date: 2020-11-25 17:59:09
 * @Description: 
-->
<template>
    <div class="xlsx-table">
        <div class="xlsx-table-draw" ref="xlsxRef"></div>
        <div class="xlsx-table-loading" v-if="loading">
            <a-icon class="loading-icon" type="loading" />
        </div>
    </div>
</template>

<script>
import LuckyExcel from 'luckyexcel';
import Spreadsheet from "z-data-spreadsheet";
import _ from 'lodash';
import dataTrans from './utils/dataTrans';

export default {
    name: 'vue-xlsx-table',
    data() {
        return {
            rawFile: '',
            sheet: '',

            data: '',
            config: '',

            loading: false,
        }
    },
    mounted() {
    },
    methods: {
        update(){
            this.graphExcel();
        },
        selectFile(fileData) {
            this.readExcel(fileData);
        },

        readExcel(fileData) {
            this.loading = true;
            LuckyExcel.transformExcelToLucky(fileData, (exportJson) => {
                this.config = dataTrans.sheet_to_config(exportJson);
                this.data = dataTrans.sheet_to_data(exportJson);

                this.graphExcel();
                this.loading = false;
            })
        },
        graphExcel: _.debounce(function() {
            if (this.sheet) {
                this.$refs.xlsxRef.innerHTML = '';
            }
            const options = {
                mode: 'read',
                showContextmenu: false,
                showToolbar: false,
                view: {
                    height: () => { return this.$el.clientHeight; },
                    width: () => { return this.$el.clientWidth; },
                },
                col: this.config.col,
                row: this.config.row,
                style: {
                    textwrap: true,
                }
            }

            this.sheet = new Spreadsheet(this.$refs.xlsxRef, options);

            this.sheet.loadData(this.data);
        }),
    }
}
</script>

<style lang="scss" scoped>
.xlsx-table {
    width: 100%;
    height: 100%;
    .xlsx-table-loading {
        height: 100%;
        width: 100%;
        position: relative;
        text-align: center;
        .loading-icon {
            font-size: 18px;
            position: absolute;
            top: 50%;
            transform: translate(0, -50%);
        }
    }
}
</style>

<style lang="scss">
.xlsx-table .x-spreadsheet-menu .x-spreadsheet-icon {
    display: none;
}
</style>