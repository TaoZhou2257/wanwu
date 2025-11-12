import service from "@/utils/request"
const BASE_URL = '/user/api/v1'

// 获取客户端统计数据
export const getData = (params) => {
    return service({
        url: `${BASE_URL}/statistic/client"`,
        method: "get",
        params,
    });
};
