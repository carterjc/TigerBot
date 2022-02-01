from bs4 import BeautifulSoup
import requests
import json


def get_res_halls():
    res_halls = ["Butler", "First", "Forbes", "Mathey", "Rockefeller", "Whitman"]
    housing_dict = {}

    # https://hres.princeton.edu/undergraduate-housing/incoming-students/about-residential-colleges
    # use links from here in the future

    url = "https://odoc.princeton.edu"
    r = requests.get(url + "/about/residential-colleges")
    soup = BeautifulSoup(r.text, 'html.parser')
    menu = soup.find_all("ul", { "class": "menu" })[4]
    res_hall_links = {}
    
    # residential hall information
    for li in menu:
        if li.text.strip() == "": continue
        if li.find_next().text in res_halls:
            hr_url = url + li.a.get('href')  # reference url (on odoc site) - housing reference url

            house_req = requests.get(hr_url)
            h_soup = BeautifulSoup(house_req.text, 'html.parser')

            h_desc = (h_soup.find_all("div", { "class": "field-items"} )[1]
                .findChild("p")
                .text
                .replace(u'\xa0', ' ')
                .replace(u'\u2019', "'")
            )
            h_img = (h_soup.find_all("div", { "class": "field-items"} )[0]
                .findChild("img")
                .get("src")
            )

            res_hall_links[li.text.strip()] = {
                "r_url": hr_url,
                "description": h_desc,
                "image": h_img
            }

    # roommate info

    # r_url = "https://hres.princeton.edu/undergraduate-housing/incoming-students/about-residential-colleges"
    # room_req = requests.get(r_url)
    # r_soup = BeautifulSoup(room_req.text, 'html.parser')

    

    with open("../bot/data/housing.json", "w") as f:
        f.write(json.dumps(res_hall_links, indent=4))

    

def main():
    get_res_halls()


main()

