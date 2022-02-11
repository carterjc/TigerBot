from bs4 import BeautifulSoup
import requests
import json

def get_certificates():
    url = "https://admission.princeton.edu/academics/certificate-programs"
    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'html.parser')  # using html.parser for no additional dependencies
    certs = soup.find("div", {"class": "content-wrapper wow"}).findChild("ul").findChildren("li")
    certs_dict = {}
    for c in certs:
        # key, value - certificate name, url
        certs_dict[c.a.text.replace(u'\xa0', ' ')] = c.a.get("href")
        # for some reason only one entry on the site has a nbsp (music performance) and it had to go
    with open("../bot/data/certificates.json", "w") as f:
        f.write(json.dumps(certs_dict, indent=4))


def get_concentrations():
    url = "https://admission.princeton.edu/academics/degrees-departments"
    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'html.parser')  # using html.parser for no additional dependencies
    # interesting format for the site. we need to start with the ab h2 tag and iterate until we hit the bse h2 tag
    ab_tag, bse_tag = soup.find("div", {"class": "content-wrapper wow"}).findChild("h2"), ''
    concs_ab, concs_bse = [], []
    for p in ab_tag.next_siblings:
        if p.text == '\n':
            continue
        if p.name == "h2":
            bse_tag = p
            break
        elif p.name == "p":
            concs_ab.append(p)
    for p in bse_tag.next_siblings:
        if p.text == '\n':
            continue
        if p.text == u'\xa0':  # trailing nbsp for some reason
            break
        concs_bse.append(p)
    concs_dict = {}
    for c in concs_ab:
        name = c.a.text.replace(u'\xa0', ' ')
        description = (c.text.replace(name, '')
            .replace(u'\xa0', ' ')
            .replace(u'\u2019', "'")
            .replace(u'\u201c', '"')
            .replace(u'\u201d', '"')

        )
        link = c.find("a").get("href")
        concs_dict[name] = {
            'link': link,
            'description': description,
            'degree': 'ab'
        }
    for c in concs_bse:
        name = c.a.text
        description = (c.text.replace(name, '')
            .replace(u'\xa0', ' ')
            .replace(u'\x20\x19', ' ')
        )
        link = c.find("a").get("href")
        concs_dict[name] = {
            'link': link,
            'description': description,
            'degree': 'bse'
        }
    with open("../bot/data/concentrations.json", "w") as f:
        f.write(json.dumps(concs_dict, indent=4))


def main():
    get_concentrations()
    get_certificates()

main()
