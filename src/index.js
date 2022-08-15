import './style.css';
import {
    format, 
    parse,
    isToday,
    isFuture,
    parseISO,
    compareAsc,
} from 'date-fns';
import Save_svg from './save.svg';
import Del_svg from './del.svg';
import Cancel_svg from './cancel.svg';

let current_tasks = [];
//0 = today, 1 = upcoming, others = project #
let cur_tab = "Today";

const task_obj = function(title, due_date, project, desc, checked, id){
    return {
        title,
        due_date,
        project, 
        desc, 
        checked,
        id
    };
};

const storage = function(){
    let projects = JSON.parse(window.localStorage.getItem("projects"));


    function saveLocalStorage(){
        window.localStorage.setItem("projects", JSON.stringify(projects));
    }

    let has_projects = !(projects === null);
    if (!has_projects){
        projects = {};
        saveLocalStorage();
    }else{
        for(let i in projects){
            for(let j in projects[i]['task']){
                projects[i]['task'][j].due_date = parseISO(projects[i]['task'][j].due_date);
            }
        }
    }
    
    function createProject(project_name, desc){
        projects[project_name] = {
            desc : desc,
            task : []
        }
        saveLocalStorage();
    }

    function modifyProject(prev_name, project_name, desc){
        let temp = projects[prev_name];
        delete projects[prev_name];
        projects[project_name] = {
            desc : desc,
            task : temp['task']
        };
        for(let i in projects[project_name]['task']){
            projects[project_name]['task'][i].project = project_name;
        }
        saveLocalStorage();
    }

    function getProjects(){
        let projects_list = [];
        for (let i in projects){
            projects_list.push(i);
        }
        return projects_list;
    }

    function addTask(task){
        task.id = projects[task.project]['task'].length;
        projects[task.project]['task'].push(task);
        saveLocalStorage();
    }

    function saveTask(task){
        projects[task.project]['task'][task.id] = task;
        saveLocalStorage();
    }

    function removeTask(task){
        projects[task.project]['task'].splice(task.id, 1);
        for(let i in projects[task.project]['task']){
            //Reassign ID
            projects[task.project]['task'][i].id = i;
        }
        saveLocalStorage();
    }

    function removeProject(project_name){
        if (project_name === '') return;
        else{
            delete projects[project_name];
        }
        saveLocalStorage();
    }
    function getProject(project_name){
        return projects[project_name];
    }


    function setCurrentTasks(){
        current_tasks = [];
        if (cur_tab === "Today"){
            for (let i in projects){
                for(let j in projects[i]['task']){
                    if (isToday(projects[i]['task'][j].due_date)){
                        current_tasks.push(projects[i]['task'][j]);
                    }
                }
            }
        }else if (cur_tab === "Upcoming"){
            for (let i in projects){
                for(let j in projects[i]['task']){
                    if (isFuture(projects[i]['task'][j].due_date)){
                        current_tasks.push(projects[i]['task'][j]);
                    }
                }
            }
        }else{
            for(let i in projects[cur_tab]['task']){
                current_tasks.push(projects[cur_tab]['task'][i]);
            }
        }
    }

    function checkKey(key){
        return (key in projects);
    }

    return {has_projects, createProject, modifyProject, getProjects, addTask, setCurrentTasks, saveTask, removeTask, removeProject, getProject, checkKey};
}();


const toDoList = function(){
    //save to local storage
    function saveTask(index){
        let title = document.querySelector("#task-title-input").value;
        let due_date = document.querySelector("#task-due-date-input").value;
        let desc = document.querySelector("#task-desc-input").value;

        let new_due_date = [];
        for(let i = 0; i < due_date.length; i++){
            if (due_date[i] === 'T'){
                new_due_date.push(" ");
            }else{
                new_due_date.push(due_date[i]);
            }
        }
        due_date = new_due_date.join("");
        if (index === current_tasks.length){
            storage.addTask(task_obj(title, parse(due_date, 'yyyy-MM-dd HH:mm', new Date()), cur_tab, desc, 0, 0));
        }else{
            current_tasks[index].title = title;
            current_tasks[index].due_date = parse(due_date, 'yyyy-MM-dd HH:mm', new Date());
            current_tasks[index].desc = desc;
            storage.saveTask(current_tasks[index]);
        }
    }

    function deleteTask(index){
        storage.removeTask(current_tasks[index]);
    }

    function toggleTask(index){
        current_tasks[index].checked = (current_tasks[index].checked === 1 ? 0 : 1);
        storage.saveTask(current_tasks[index]);
    }

    function sortTask(){
        current_tasks.sort(function (a,b){
            if (a.checked !== b.checked){
                return (a.checked == 1 && b.checked == 0 ? -1 : 1);
            }else{
                return (compareAsc(a.due_date, b.due_date) >= 0 ? 1 : -1);
            }
        });
    }


    function saveProject(project_name){
        let title = document.querySelector("#project-title-input").value;
        let desc = document.querySelector("#project-desc-input").value;
        if (project_name === ""){
            storage.createProject(title, desc);
        }else{
            storage.modifyProject(project_name,title,desc);
        }
    }

    return {saveTask, deleteTask, toggleTask, sortTask, saveProject};
}();

const displayController = function(){
    const _content = document.querySelector("#content");

    function createTask(index){
        const task = current_tasks[index];
        const task_box = document.createElement("div");
        task_box.classList.add("task-box");

        const check_box = document.createElement("div");
        check_box.classList.add("check-box");
        const check = document.createElement("div");
        check.classList.add("check");
        check.addEventListener("click",function(){
            toDoList.toggleTask(index);
            updateTask();
        });
        check_box.appendChild(check);
        task_box.appendChild(check_box);

        const task_click_region = document.createElement("div");
        task_click_region.classList.add("task-click");
        
        const task_title = document.createElement('h4');
        task_title.classList.add("task-title");
        task_title.textContent = task.title;

        const span_late = document.createElement("span");
        if (!isFuture(current_tasks[index].due_date) && !current_tasks[index].checked){
            span_late.classList.add("late");
            span_late.textContent = "!";
        }
        task_title.appendChild(span_late);


        task_click_region.appendChild(task_title);
        
        const task_info = document.createElement("div");
        task_info.classList.add("task-info");
        const due_date = document.createElement("h6");
        due_date.classList.add("due-date");
        due_date.textContent = format(task.due_date, "h:mm a MM/dd/yyyy");
        const task_project = document.createElement("h6");
        task_project.classList.add("task-project");
        task_project.textContent = `# ${task.project}`;

        task_info.append(due_date);
        task_info.append(task_project);
        if (task.checked === 1){
            check.classList.add("checked");
            task_title.classList.add("done");
        }

        task_click_region.appendChild(task_info);
        
        //Add Event Listener
        task_click_region.addEventListener("click", function(){
            taskPopUp(index);
            //update information
        });

        task_box.appendChild(task_click_region);
        return task_box;
    }

    function switchTab(){
        const tab_title = document.querySelector('.tab-title');
        tab_title.textContent = cur_tab;
    }

    function taskClear(){
        const task_flex_box = document.querySelector(".task-flex-box");
        task_flex_box.innerHTML = "";
    }

    function updateTask(){
        const task_flex_box = document.querySelector(".task-flex-box");
        taskClear();
        storage.setCurrentTasks();
        toDoList.sortTask();
        for(let i = 0; i < current_tasks.length; i++){
            task_flex_box.appendChild(createTask(i));
        }
        if (cur_tab != "Today" && cur_tab != "Upcoming"){
            addNewTaskBtn();
        }
    }

    function addNewTaskBtn(){
        const task_flex_box = document.querySelector(".task-flex-box");

        const add_new_box = document.createElement("div");
        add_new_box.classList.add("add-new-box");

        const add_btn = document.createElement("div");
        add_btn.textContent = "+";
        add_btn.classList.add("add-btn");
        add_new_box.appendChild(add_btn);

        const title_text = document.createElement("h4");
        title_text.textContent = "Add New Task";
        add_new_box.appendChild(add_btn);
        add_new_box.appendChild(title_text);
        
        add_new_box.addEventListener("click",function(){
            taskPopUp(current_tasks.length);
        });

        task_flex_box.appendChild(add_new_box);
    }

    function updateProjects(){
        const project_ul = document.querySelector(".projects ul");
        project_ul.innerHTML = "";
        let project_list = storage.getProjects();
        for (let i = 0; i < project_list.length; i++){
            const li = document.createElement("li");

            li.addEventListener("click", function(){
                cur_tab = project_list[i];
                switchTab();
                updateTask();
            });

            const p = document.createElement("p");
            const btn = document.createElement("div");
            btn.addEventListener("click", function(){
                projectPopUp(project_list[i]);
            });
            btn.classList.add("project-edit-btn");
            p.textContent = `# ${project_list[i]}`;
            li.appendChild(p);
            li.appendChild(btn);
            project_ul.appendChild(li);
        }
    }

    function initBasicUI(){
        const main_content = document.createElement("div");
        main_content.classList.add("main-content");
        _content.appendChild(main_content);

        const header = document.createElement("div");
        header.classList.add("header");
        const page_title = document.createElement("h1");
        page_title.classList.add("title");
        page_title.textContent = "myTodo";
        
        header.appendChild(page_title);
        main_content.appendChild(header);

        const grid_box = document.createElement("div");
        grid_box.classList.add("grid-box");

        main_content.appendChild(grid_box);

        //Initialize tabs UI
        const tabs = document.createElement("div");
        tabs.classList.add("tabs");

        const today_tab = document.createElement("div");
        today_tab.classList.add("today");
        today_tab.addEventListener("click", function(){
            cur_tab = "Today";
            switchTab();
            updateTask();
        });
        const upcoming_tab = document.createElement("div");
        upcoming_tab.classList.add("upcoming");
        upcoming_tab.addEventListener("click", function(){
            cur_tab = "Upcoming";
            switchTab();
            updateTask();
        });
        today_tab.classList.add("tab");
        upcoming_tab.classList.add("tab");

        const today_text = document.createElement("h3");
        today_text.textContent = "Today";
        const upcoming_text = document.createElement("h3");
        upcoming_text.textContent = "Upcoming";

        today_tab.appendChild(today_text);
        upcoming_tab.appendChild(upcoming_text);

        tabs.appendChild(today_tab);
        tabs.appendChild(upcoming_tab);

        const projects = document.createElement("div");
        projects.classList.add("projects");

        const project_title = document.createElement("div");
        project_title.classList.add("projects-title");
        project_title.classList.add("new-proj-btn");
        project_title.classList.add("tab");
        const project_title_text = document.createElement("h3");
        project_title_text.textContent = "Projects";
        const project_title_plus = document.createElement("h3");
        project_title_plus.classList.add("plus");
        project_title_plus.textContent = "+";
        project_title.appendChild(project_title_text);
        project_title.appendChild(project_title_plus);
        project_title.addEventListener("click", function(){
            projectPopUp("");
        });
        
        const ul = document.createElement("ul");
        
        projects.appendChild(project_title);
        projects.appendChild(ul);

        tabs.appendChild(projects);

        grid_box.appendChild(tabs);

        //Initialize tasks UI
        const tasks = document.createElement("div");
        tasks.classList.add("tasks");
        const tab_title = document.createElement("h2");
        tab_title.classList.add("tab-title");
        tab_title.textContent = "Today";

        tasks.appendChild(tab_title);

        const task_flex_box = document.createElement("div");
        task_flex_box.classList.add("task-flex-box");
        
        tasks.appendChild(task_flex_box);
        grid_box.appendChild(tasks);
    }

    function taskInputValidate(){
        let title = document.querySelector("#task-title-input").value;
        let due_date = document.querySelector("#task-due-date-input").value;
        if (title === '' || due_date === '') return false;
        return true;
    }

    function projectInputValidate(project_name){
        const title = document.querySelector("#project-title-input").value;
        if (title === '' || (project_name != title && storage.checkKey(title))){
            return false;
        }
        return true;
    }

    function getDefaultTask(){
        //Default task
        storage.createProject("Personal", "My personal todo list!");
        storage.createProject("Project 1", "Hoola! Project 1!");
        storage.createProject("Project 2", "Hoola! This is project 2!");
        const default1 = task_obj("Work", new Date(2022, 7, 15, 20,10) , "Project 1","Keep working!",0, 0);
        storage.addTask(default1);
        const default2 = task_obj("Swim",new Date(2022, 9, 15, 10,15) , "Project 2","Learn to swim!",0, 0);
        storage.addTask(default2);
        const default3 = task_obj("Code",new Date(2022, 8, 15, 10,20) , "Personal","Finish the unfinished task.",0, 0);
        storage.addTask(default3);
    }

    function closePopUp(selector){
        const pop_up = document.querySelector(selector);
        _content.removeChild(pop_up);
    }

    function taskPopUp(index){
        const task_view_box = document.createElement("div");
        task_view_box.classList.add("task-view-box");

        const task_view = document.createElement("div");
        task_view.classList.add("task-view");

        let input_divs = [];
        for(let i = 0; i < 4; i++){
            const input_div = document.createElement("div");
            input_div.classList.add("input");
            input_divs.push(input_div);
        }

        input_divs[0].classList.add("input-title");
        const label_title = document.createElement("label");
        label_title.for = "task-title-input";
        label_title.textContent = "Title*";
        const input_title = document.createElement("input");
        input_title.type = "text";
        input_title.id = "task-title-input"
        input_title.value = (index < current_tasks.length ? current_tasks[index].title : "");
        input_divs[0].appendChild(label_title);
        input_divs[0].appendChild(input_title);
        

        input_divs[1].classList.add("input-due-date");
        const label_due_date = document.createElement("label");
        label_due_date.for = "task-due-date-input";
        label_due_date.textContent = "Due Date*";
        const input_due_date = document.createElement("input");
        input_due_date.type = "datetime-local";
        input_due_date.id = "task-due-date-input"
        input_due_date.value = (index < current_tasks.length ? format(current_tasks[index].due_date, "yyyy-MM-dd HH:mm") : "");
        input_divs[1].appendChild(label_due_date);
        input_divs[1].appendChild(input_due_date);

        input_divs[2].classList.add("input-project");
        const label_project = document.createElement("label");
        label_project.textContent = "Project";
        const span_project = document.createElement("span");
        span_project.textContent = cur_tab;
        span_project.classList.add("task-project-input");
        input_divs[2].appendChild(label_project);
        input_divs[2].appendChild(span_project);

        input_divs[3].classList.add("input-desc");
        const label_desc = document.createElement("label");
        label_desc.for = "task-desc-input";
        label_desc.textContent = "Description";
        const textarea = document.createElement("textarea");
        textarea.id = "task-desc-input";
        textarea.cols = "30";
        textarea.rows = "10";
        textarea.textContent = (index < current_tasks.length ? current_tasks[index].desc : "");
        input_divs[3].appendChild(label_desc);
        input_divs[3].appendChild(textarea);

        for (const i of input_divs){
            task_view.appendChild(i);
        }

        const task_view_btns = document.createElement("div");
        task_view_btns.classList.add("task-view-btns");

        let btn_divs = [];
        for(let i = 0; i < 3; i++){
            const btn_div = document.createElement("div");
            btn_div.classList.add("task-btn");
            btn_divs.push(btn_div);
        }
        btn_divs[0].classList.add("task-del");
        const img_del = new Image();
        img_del.src = Del_svg;
        img_del.alt = "del-svg";
        btn_divs[0].appendChild(img_del);
        btn_divs[0].addEventListener("click",function(){
            if (index === current_tasks.length){
                return;
            }
            toDoList.deleteTask(index);
            closePopUp(".task-view-box");
            updateTask();
        });

        btn_divs[1].classList.add("task-cancel");
        const img_cancel = new Image();
        img_cancel.src = Cancel_svg;
        img_cancel.alt = "cancel-svg";
        btn_divs[1].appendChild(img_cancel);
        btn_divs[1].addEventListener("click", function(){
            closePopUp(".task-view-box");
        });

        btn_divs[2].classList.add("task-save");
        const img_save = new Image();
        img_save.src = Save_svg;
        img_save.alt = "save-svg";
        btn_divs[2].appendChild(img_save);
        btn_divs[2].addEventListener("click",function(){
            if (!taskInputValidate()){
                let title = document.querySelector("#task-title-input")
                let due_date = document.querySelector("#task-due-date-input");
                title.classList.add("required");
                due_date.classList.add("required");
                return;
            }
            toDoList.saveTask(index);
            closePopUp(".task-view-box");
            updateTask();
        });

        for(const i of btn_divs){
            task_view_btns.appendChild(i);
        }
        task_view.appendChild(task_view_btns);

        task_view_box.appendChild(task_view);
        _content.appendChild(task_view_box);
    }

    function projectPopUp(project_name){
        let project = {};
        if (project_name != ""){
            project = storage.getProject(project_name);
        }
        const project_view_box = document.createElement("div");
        project_view_box.classList.add("project-view-box");

        const project_view = document.createElement("div");
        project_view.classList.add("project-view");

        let input_divs = [];
        for(let i = 0; i < 2; i++){
            const input_div = document.createElement("div");
            input_div.classList.add("input");
            input_divs.push(input_div);
        }

        input_divs[0].classList.add("project-title");
        const label_title = document.createElement("label");
        label_title.for = "project-title-input";
        label_title.textContent = "Project Title*";
        const input_title = document.createElement("input");
        input_title.type = "text";
        input_title.id = "project-title-input"
        input_title.value = project_name;
        input_divs[0].appendChild(label_title);
        input_divs[0].appendChild(input_title);
        

        input_divs[1].classList.add("project-desc");
        const label_desc = document.createElement("label");
        label_desc.for = "project-desc-input";
        label_desc.textContent = "Description";
        const textarea = document.createElement("textarea");
        textarea.id = "project-desc-input";
        textarea.cols = "30";
        textarea.rows = "10";
        textarea.textContent = (project_name != '' ? project.desc : "");
        input_divs[1].appendChild(label_desc);
        input_divs[1].appendChild(textarea);

        for (const i of input_divs){
            project_view.appendChild(i);
        }

        const project_view_btns = document.createElement("div");
        project_view_btns.classList.add("project-view-btns");

        let btn_divs = [];
        for(let i = 0; i < 3; i++){
            const btn_div = document.createElement("div");
            btn_div.classList.add("project-btn");
            btn_divs.push(btn_div);
        }
        btn_divs[0].classList.add("project-del");
        const img_del = new Image();
        img_del.src = Del_svg;
        img_del.alt = "del-svg";
        btn_divs[0].appendChild(img_del);
        btn_divs[0].addEventListener("click",function(){
            storage.removeProject(project_name);
            if (cur_tab === project_name){
                cur_tab = "Today";
                switchTab();
            }
            closePopUp(".project-view-box")
            updateProjects();
            updateTask();
        });

        btn_divs[1].classList.add("project-cancel");
        const img_cancel = new Image();
        img_cancel.src = Cancel_svg;
        img_cancel.alt = "cancel-svg";
        btn_divs[1].appendChild(img_cancel);
        btn_divs[1].addEventListener("click", function(){
            closePopUp(".project-view-box");
        });

        btn_divs[2].classList.add("project-save");
        const img_save = new Image();
        img_save.src = Save_svg;
        img_save.alt = "save-svg";
        btn_divs[2].appendChild(img_save);
        btn_divs[2].addEventListener("click",function(){
            if (!projectInputValidate(project_name)){
                const input = document.querySelector("#project-title-input");
                input.value = "";
                input.placeholder = "Project name is either used or invalid."
                input.classList.add("required");
                return;
            }
            toDoList.saveProject(project_name);
            if (cur_tab === project_name){
                cur_tab = document.querySelector("#project-title-input").value;
                switchTab();
            }
            closePopUp(".project-view-box")
            updateProjects();
            updateTask();
        });

        for(const i of btn_divs){
            i.addEventListener("click", function (){
            });
            project_view_btns.appendChild(i);
        }
        project_view.appendChild(project_view_btns);

        project_view_box.appendChild(project_view);
        _content.appendChild(project_view_box);
    }


    function init(){
        initBasicUI();
        //no tasks found in storage
        if (!storage.has_projects){
            getDefaultTask();
            updateTask();
            updateProjects();
        }else{
            updateTask();
            updateProjects();
        }
    }

    //return some function that might be needed for external use
    init();
}();

