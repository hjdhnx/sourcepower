import { defineStore } from "pinia";

import { apiLogin, userInfo } from "@/api/user";
import { usePermissionStore } from "@/store";

const InitUserInfo = {
  username: "",
  email: "",
  id: 0,
  roles: [],
};

export const useUserStore = defineStore("user", {
  state: () => ({
    token: "",
    userInfo: { ...InitUserInfo },
  }),
  getters: {
    roles: (state) => {
      return state.userInfo?.roles;
    },
  },
  actions: {
    async login(userInfo) {
      const mockLogin = async (userInfo) => {
        const response = await apiLogin(userInfo);

        if (response.code === 0) {
          return {
            code: 0,
            message: response.msg,
            data: response.data,
          };
        } else {
          return {
            code: -1,
            message: response.msg,
            data: response.data,
          };
        }
      };

      const res = await mockLogin(userInfo);
      if (res.code === 0) {
        this.token = res.data.token;
        this.userInfo = res.data.user;

        const permissionStore = usePermissionStore();
        console.log(2)
        permissionStore.initRoutes(this.userInfo.roles);
      } else {
        throw res;
      }
    },
    async getUserInfo() {
      const mockRemoteUserInfo = async (token) => {
        if (token) {
          const response = await userInfo();

          if (response.code === 0) {
            return {
              code: 0,
              message: response.msg,
              data: response.data,
            };
          } else {
            return {
              code: -1,
              message: response.msg,
              data: response.data,
            };
          }
        }

        //   if (token === "main_token") {
        //     return {
        //       name: "Tencent",
        //       roles: ["all"],
        //     };
        //   }
        //   return {
        //     name: "td_dev",
        //     roles: ["UserIndex", "DashboardBase", "login"],
        //   };
      };
      console.log(this.token);
      let res = await mockRemoteUserInfo(this.token);

      if (res.code === 0) {
        this.userInfo = res.data.user;
      } else {
        console.log(res);
        throw res;
      }
    },
    async logout() {
      this.token = "";
      this.userInfo = { ...InitUserInfo };
    },
  },
  persist: {
    afterHydrate: async (ctx) => {
      if (ctx.store.userInfo.roles && ctx.store.userInfo.roles.length > 0) {
        const permissionStore = usePermissionStore();
        permissionStore.initRoutes(ctx.store.userInfo.roles);
      }
    },
    key: "user",
    pick: ["token", "userInfo"],
  },
});
